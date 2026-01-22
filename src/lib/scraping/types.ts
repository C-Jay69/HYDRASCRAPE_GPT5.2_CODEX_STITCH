export interface ScrapingConfig {
  urlPatterns: string[]
  rateLimit: number
  proxyRotation: boolean
  javascriptRender: boolean
  maxRetries: number
  timeoutSeconds: number
  captchaHandling: 'pause' | 'solve' | 'skip'
  maxProducts?: number
  robotsCompliance: boolean
  selectors?: Record<string, string>
}

export interface ScrapedProduct {
  productId: string
  productUrl: string
  title: string
  description?: string
  mainCategory?: string
  subCategory?: string
  price?: number
  originalPrice?: number
  currency?: string
  shippingCost?: number
  shippingTimeEstimate?: string
  vendorName?: string
  vendorRating?: number
  productRating?: number
  reviewCount?: number
  imagesUrls?: string[]
  variantOptions?: string
  stockStatus?: string
  minimumOrderQuantity?: number
  weight?: number
  dimensions?: string
  sku?: string
}

export interface ScrapingResult {
  success: boolean
  products: ScrapedProduct[]
  errors: string[]
  captchaEvents: number
  pagesScraped: number
}

export interface ScraperOptions {
  onProgress?: (progress: number, productsScraped: number) => void
  onLog?: (level: 'info' | 'warning' | 'error' | 'debug', message: string, details?: any) => void
  onCancel?: () => boolean
}

export type PlatformType = 'cj' | 'aliexpress' | 'alibaba' | 'shopify' | 'generic'
