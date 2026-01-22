const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

const SCREEN_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1600, height: 900 },
]

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

const LANGUAGES = [
  'en-US,en;q=0.9',
  'en-GB,en;q=0.9',
  'en-CA,en;q=0.9',
  'en-AU,en;q=0.9',
  'de-DE,de;q=0.9',
  'fr-FR,fr;q=0.9',
  'ja-JP,ja;q=0.9',
  'zh-CN,zh;q=0.9',
]

/**
 * Get a random user agent string
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/**
 * Get random screen dimensions
 */
export function getRandomScreenResolution() {
  return SCREEN_RESOLUTIONS[Math.floor(Math.random() * SCREEN_RESOLUTIONS.length)]
}

/**
 * Get random timezone
 */
export function getRandomTimezone(): string {
  return TIMEZONES[Math.floor(Math.random() * TIMEZONES.length)]
}

/**
 * Get random language preference
 */
export function getRandomLanguage(): string {
  return LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)]
}

/**
 * Generate random browser fingerprint configuration
 */
export function generateFingerprintConfig() {
  const resolution = getRandomScreenResolution()
  return {
    userAgent: getRandomUserAgent(),
    viewport: {
      width: resolution.width,
      height: resolution.height,
    },
    locale: getRandomLanguage().split(',')[0],
    timezoneId: getRandomTimezone(),
    // Random browser-like characteristics
    colorScheme: Math.random() > 0.3 ? 'light' : 'dark' as 'light' | 'dark',
    reducedMotion: Math.random() > 0.9,
  }
}

/**
 * Simulate human-like delays
 */
export function getRandomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Calculate delay with exponential backoff
 */
export function getBackoffDelay(attempt: number, baseDelay: number = 1000): number {
  const maxDelay = 30000 // 30 seconds max
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  // Add some jitter
  return Math.floor(delay * (0.8 + Math.random() * 0.4))
}

/**
 * Sleep function for explicit delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Normalize URL (remove tracking parameters, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source']
    trackingParams.forEach(param => urlObj.searchParams.delete(param))
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

/**
 * Check if URL matches any pattern
 */
export function urlMatchesPatterns(url: string, patterns: string[]): boolean {
  const domain = extractDomain(url).toLowerCase()
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(domain) || regex.test(url.toLowerCase())
  })
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(requestsPerSecond: number) {
    this.maxRequests = requestsPerSecond
    this.windowMs = 1000 // 1 second window
  }

  async acquire(): Promise<void> {
    const now = Date.now()

    // Remove requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    // If we've hit the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.windowMs - (now - oldestRequest) + 10
      if (waitTime > 0) {
        await sleep(waitTime)
      }
    }

    // Record this request
    this.requests.push(Date.now())
  }
}
