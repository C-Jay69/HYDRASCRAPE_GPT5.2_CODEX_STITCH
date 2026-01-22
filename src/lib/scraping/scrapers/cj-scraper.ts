import { BaseScraper } from '../base-scraper'
import { ScrapingConfig, ScraperOptions, ScrapedProduct } from '../types'

export class CJDropshippingScraper extends BaseScraper {
  constructor(config: ScrapingConfig, options: ScraperOptions = {}) {
    super('cj', config, options)
  }

  /**
   * Get URLs to scrape from CJ Dropshipping
   */
  protected async getUrlsToScrape(): Promise<string[]> {
    const urls: string[] = []

    // For now, return URLs from config patterns
    // In production, this would discover category/product URLs
    for (const pattern of this.config.urlPatterns) {
      // If pattern is a full URL, add it directly
      if (pattern.startsWith('http')) {
        urls.push(pattern)
      }
      // If it's a category URL, we could discover product URLs from it
      // This is a simplified version
    }

    return urls
  }

  /**
   * Extract products from a CJ Dropshipping page
   */
  protected async extractProductsFromPage(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = []

    try {
      // Wait for product elements to load
      await this.page!.waitForSelector('.product-item, .product-card, .goods-item', { timeout: 5000 })

      // Find product containers
      const productElements = await this.page!.$$(
        '.product-item, .product-card, .goods-item, [class*="product"]'
      )

      this.log('info', `Found ${productElements.length} product elements`)

      for (const element of productElements) {
        if (this.isCancelled) break

        try {
          const product = await this.extractProduct(element)
          if (product) {
            products.push(product)
          }
        } catch (error) {
          this.log('error', `Error extracting product: ${error instanceof Error ? error.message : 'Unknown'}`)
        }
      }

    } catch (error) {
      this.log('error', `Error extracting products from page: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    return products
  }

  /**
   * Extract product data from a product element
   */
  private async extractProduct(element: any): Promise<ScrapedProduct | null> {
    // Try to find product link
    const linkElement = await element.$('a[href]')
    const productUrl = linkElement
      ? await linkElement.getAttribute('href')
      : null

    if (!productUrl) return null

    // Extract product ID from URL
    const productIdMatch = productUrl.match(/product\/(\d+)/) || productUrl.match(/\/(\d+)\.html/)
    const productId = productIdMatch ? productIdMatch[1] : `CJ-${Date.now()}`

    // Extract title
    const titleElement = await element.$('.title, .product-title, .goods-title, h3, h4')
    const title = titleElement
      ? await titleElement.textContent()
      : null

    if (!title) return null

    // Extract price
    const priceElement = await element.$('.price, .product-price, .goods-price, [class*="price"]')
    const priceText = priceElement
      ? await priceElement.textContent()
      : null
    const price = priceText ? this.extractNumber(priceText) : null

    // Extract original price
    const originalPriceElement = await element.$('.original-price, .market-price, del')
    const originalPriceText = originalPriceElement
      ? await originalPriceElement.textContent()
      : null
    const originalPrice = originalPriceText ? this.extractNumber(originalPriceText) : null

    // Extract image
    const imageElement = await element.$('img[src]')
    const imageUrl = imageElement
      ? await imageElement.getAttribute('src')
      : null

    return {
      productId,
      productUrl: productUrl.startsWith('http') ? productUrl : `https://cjdropshipping.com${productUrl}`,
      title: title.trim(),
      price,
      originalPrice,
      currency: 'USD',
      imagesUrls: imageUrl ? [imageUrl] : undefined,
      platformSource: 'CJ',
    }
  }
}
