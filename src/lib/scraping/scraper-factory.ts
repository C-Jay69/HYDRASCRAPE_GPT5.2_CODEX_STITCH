import { CJDropshippingScraper } from './scrapers/cj-scraper'
import { AliExpressScraper } from './scrapers/aliexpress-scraper'
import { AlibabaScraper } from './scrapers/alibaba-scraper'
import { ShopifyScraper } from './scrapers/shopify-scraper'
import { ScrapingConfig, ScraperOptions, ScrapingResult, PlatformType } from './types'

/**
 * Create a scraper instance for the specified platform
 */
export function createScraper(
  platform: PlatformType | string,
  config: ScrapingConfig,
  options: ScraperOptions = {}
) {
  const platformLower = platform.toLowerCase()

  switch (platformLower) {
    case 'cj':
    case 'cjdropshipping':
    case 'cj-dropshipping':
      return new CJDropshippingScraper(config, options)

    case 'ali':
    case 'aliexpress':
    case 'ali-express':
      return new AliExpressScraper(config, options)

    case 'alibaba':
    case 'ali-baba':
      return new AlibabaScraper(config, options)

    case 'shopify':
      // Shopify needs a domain - extract from config if available
      const domain = config.urlPatterns[0]?.match(/https?:\/\/([^/]+)/)?.[1] || 'example.myshopify.com'
      return new ShopifyScraper(domain, config, options)

    case 'generic':
    default:
      // For generic or unknown platforms, try to use CJ scraper as default
      // In production, you might want a more sophisticated generic scraper
      return new CJDropshippingScraper(config, options)
  }
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): PlatformType[] {
  return ['cj', 'aliexpress', 'alibaba', 'shopify', 'generic']
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: PlatformType | string): string {
  const names: Record<string, string> = {
    cj: 'CJ Dropshipping',
    cjdropshipping: 'CJ Dropshipping',
    'cj-dropshipping': 'CJ Dropshipping',
    ali: 'AliExpress',
    aliexpress: 'AliExpress',
    'ali-express': 'AliExpress',
    alibaba: 'Alibaba',
    'ali-baba': 'Alibaba',
    shopify: 'Shopify',
    generic: 'Generic',
  }

  return names[platform.toLowerCase()] || platform
}

/**
 * Validate scraping configuration
 */
export function validateScrapingConfig(config: ScrapingConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.urlPatterns || config.urlPatterns.length === 0) {
    errors.push('At least one URL pattern is required')
  }

  if (config.rateLimit <= 0) {
    errors.push('Rate limit must be greater than 0')
  }

  if (config.rateLimit > 100) {
    errors.push('Rate limit should not exceed 100 requests per second')
  }

  if (config.maxRetries < 0) {
    errors.push('Max retries cannot be negative')
  }

  if (config.timeoutSeconds < 5) {
    errors.push('Timeout should be at least 5 seconds')
  }

  if (config.maxProducts !== undefined && config.maxProducts <= 0) {
    errors.push('Max products must be greater than 0')
  }

  const validHandlers = ['pause', 'solve', 'skip']
  if (!validHandlers.includes(config.captchaHandling)) {
    errors.push(`Invalid captcha handling: ${config.captchaHandling}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create a default configuration for a platform
 */
export function createDefaultConfig(platform: PlatformType): ScrapingConfig {
  const baseConfig: ScrapingConfig = {
    urlPatterns: [],
    rateLimit: 6,
    proxyRotation: true,
    javascriptRender: true,
    maxRetries: 5,
    timeoutSeconds: 30,
    captchaHandling: 'pause',
    robotsCompliance: true,
  }

  // Platform-specific defaults
  switch (platform) {
    case 'cj':
      return {
        ...baseConfig,
        rateLimit: 6,
        urlPatterns: ['https://cjdropshipping.com'],
      }
    case 'aliexpress':
      return {
        ...baseConfig,
        rateLimit: 4,
        urlPatterns: ['https://aliexpress.com'],
      }
    case 'alibaba':
      return {
        ...baseConfig,
        rateLimit: 5,
        urlPatterns: ['https://alibaba.com'],
      }
    case 'shopify':
      return {
        ...baseConfig,
        rateLimit: 10,
        urlPatterns: [],
      }
    default:
      return baseConfig
  }
}
