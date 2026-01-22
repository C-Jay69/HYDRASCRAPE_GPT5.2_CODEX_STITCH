import { chromium, Browser, Page, BrowserContext } from 'playwright'
import {
  ScrapingConfig,
  ScrapedProduct,
  ScrapingResult,
  ScraperOptions,
  PlatformType,
} from './types'
import {
  generateFingerprintConfig,
  getRandomDelay,
  getBackoffDelay,
  RateLimiter,
  normalizeUrl,
  sleep,
} from './anti-detection'

export abstract class BaseScraper {
  protected config: ScrapingConfig
  protected options: ScraperOptions
  protected platform: PlatformType
  protected browser: Browser | null = null
  protected context: BrowserContext | null = null
  protected page: Page | null = null
  protected rateLimiter: RateLimiter
  protected isCancelled = false

  constructor(
    platform: PlatformType,
    config: ScrapingConfig,
    options: ScraperOptions = {}
  ) {
    this.platform = platform
    this.config = config
    this.options = options
    this.rateLimiter = new RateLimiter(config.rateLimit)

    // Set up cancellation check
    if (options.onCancel) {
      const checkCancel = () => {
        if (options.onCancel && options.onCancel()) {
          this.isCancelled = true
        }
      }
      // Check cancellation periodically
      setInterval(checkCancel, 1000)
    }
  }

  /**
   * Initialize the browser and page
   */
  protected async initialize(): Promise<void> {
    const fingerprint = generateFingerprintConfig()

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    })

    this.context = await this.browser.newContext({
      userAgent: fingerprint.userAgent,
      viewport: fingerprint.viewport,
      locale: fingerprint.locale,
      timezoneId: fingerprint.timezoneId,
      colorScheme: fingerprint.colorScheme,
      reducedMotion: fingerprint.reducedMotion,
      // Extra anti-detection
      permissions: ['geolocation'],
      geolocation: { longitude: -74.006, latitude: 40.7128 }, // New York
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    })

    // Add extra headers
    await this.context.setExtraHTTPHeaders({
      'Accept-Language': fingerprint.locale + ',en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    })

    // Stealth: hide automation indicators
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      })

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      })

      window.chrome = {
        runtime: {},
      } as any
    })

    this.page = await this.context.newPage()

    // Set default timeout
    this.page.setDefaultTimeout(this.config.timeoutSeconds * 1000)

    // Handle console messages
    this.page.on('console', msg => {
      if (this.options.onLog) {
        const level = msg.type() as 'info' | 'warning' | 'error'
        this.options.onLog(level, `Page console: ${msg.text()}`)
      }
    })

    // Handle errors
    this.page.on('pageerror', error => {
      if (this.options.onLog) {
        this.options.onLog('error', `Page error: ${error.message}`)
      }
    })
  }

  /**
   * Navigate to a URL with retry logic
   */
  protected async navigateToUrl(url: string, maxRetries?: number): Promise<boolean> {
    const retries = maxRetries ?? this.config.maxRetries

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (this.isCancelled) return false

        // Rate limit
        await this.rateLimiter.acquire()

        // Add random delay before navigation
        await getRandomDelay(500, 2000)

        const response = await this.page!.goto(url, {
          waitUntil: 'networkidle',
          timeout: this.config.timeoutSeconds * 1000,
        })

        if (!response || !response.ok()) {
          throw new Error(`HTTP ${response?.status() || 'no response'}`)
        }

        // Check for CAPTCHA
        const hasCaptcha = await this.detectCaptcha()
        if (hasCaptcha) {
          await this.handleCaptcha(url)
        }

        // Add random delay after navigation
        await getRandomDelay(1000, 3000)

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.log('error', `Navigation failed (attempt ${attempt + 1}/${retries}): ${errorMessage}`)

        if (attempt < retries - 1) {
          const backoffDelay = getBackoffDelay(attempt)
          this.log('info', `Retrying after ${backoffDelay}ms...`)
          await sleep(backoffDelay)
        }
      }
    }

    return false
  }

  /**
   * Detect CAPTCHA on the page
   */
  protected async detectCaptcha(): Promise<boolean> {
    if (!this.page) return false

    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[src*="captcha"]',
      '[class*="captcha"]',
      '[id*="captcha"]',
      '.g-recaptcha',
      '#recaptcha',
    ]

    for (const selector of captchaSelectors) {
      const element = await this.page.$(selector)
      if (element) return true
    }

    // Check for CAPTCHA in page text
    const pageText = await this.page.textContent('body')
    if (pageText?.toLowerCase().includes('captcha')) {
      return true
    }

    return false
  }

  /**
   * Handle CAPTCHA detection
   */
  protected async handleCaptcha(url: string): Promise<void> {
    this.log('warning', 'CAPTCHA detected')

    switch (this.config.captchaHandling) {
      case 'pause':
        this.log('info', 'Pausing due to CAPTCHA. Waiting for manual intervention...')
        await sleep(60000) // Wait 1 minute
        break

      case 'solve':
        this.log('info', 'CAPTCHA solving not yet implemented. Skipping...')
        break

      case 'skip':
        this.log('info', 'Skipping page due to CAPTCHA')
        break
    }
  }

  /**
   * Extract products from a page - must be implemented by subclasses
   */
  protected abstract extractProductsFromPage(): Promise<ScrapedProduct[]>

  /**
   * Get URLs to scrape - must be implemented by subclasses
   */
  protected abstract getUrlsToScrape(): Promise<string[]>

  /**
   * Run the scraper
   */
  async run(): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      products: [],
      errors: [],
      captchaEvents: 0,
      pagesScraped: 0,
    }

    try {
      await this.initialize()
      this.log('info', `Starting ${this.platform} scraper`)

      const urls = await this.getUrlsToScrape()
      this.log('info', `Found ${urls.length} URLs to scrape`)

      const maxProducts = this.config.maxProducts || Infinity

      for (let i = 0; i < urls.length; i++) {
        if (this.isCancelled) {
          this.log('info', 'Scraping cancelled by user')
          break
        }

        if (result.products.length >= maxProducts) {
          this.log('info', `Reached max products limit: ${maxProducts}`)
          break
        }

        const url = urls[i]
        this.log('info', `Scraping URL ${i + 1}/${urls.length}: ${url}`)

        try {
          const success = await this.navigateToUrl(url)
          if (!success) {
            result.errors.push(`Failed to navigate to ${url}`)
            continue
          }

          const products = await this.extractProductsFromPage()
          result.products.push(...products)
          result.pagesScraped++

          // Update progress
          const progress = Math.floor(((i + 1) / urls.length) * 100)
          if (this.options.onProgress) {
            this.options.onProgress(progress, result.products.length)
          }

          this.log('info', `Extracted ${products.length} products from this page`)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push(`Error scraping ${url}: ${errorMessage}`)
          this.log('error', errorMessage)
        }
      }

      result.success = result.products.length > 0
      this.log('info', `Scraping complete. Extracted ${result.products.length} products total`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Fatal error: ${errorMessage}`)
      this.log('error', errorMessage)
    } finally {
      await this.cleanup()
    }

    return result
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close()
    }
    if (this.browser) {
      await this.browser.close()
    }
  }

  /**
   * Log a message
   */
  protected log(level: 'info' | 'warning' | 'error' | 'debug', message: string, details?: any): void {
    if (this.options.onLog) {
      this.options.onLog(level, message, details)
    }
  }

  /**
   * Extract text content from an element
   */
  protected async extractText(selector: string): Promise<string | null> {
    if (!this.page) return null
    try {
      const element = await this.page.$(selector)
      return element ? (await element.textContent())?.trim() || null : null
    } catch {
      return null
    }
  }

  /**
   * Extract attribute from an element
   */
  protected async extractAttribute(selector: string, attribute: string): Promise<string | null> {
    if (!this.page) return null
    try {
      const element = await this.page.$(selector)
      return element ? (await element.getAttribute(attribute)) || null : null
    } catch {
      return null
    }
  }

  /**
   * Extract number from text
   */
  protected extractNumber(text: string | null): number | null {
    if (!text) return null
    const match = text.match(/[\d.,]+/)
    if (!match) return null
    return parseFloat(match[0].replace(/,/g, ''))
  }

  /**
   * Extract multiple text elements
   */
  protected async extractTexts(selector: string): Promise<string[]> {
    if (!this.page) return []
    try {
      const elements = await this.page.$$(selector)
      const texts = await Promise.all(
        elements.map(el => el.textContent())
      )
      return texts.filter(t => t !== null).map(t => t!.trim())
    } catch {
      return []
    }
  }
}
