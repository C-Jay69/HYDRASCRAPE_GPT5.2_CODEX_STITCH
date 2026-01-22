import { BaseScraper } from '../base-scraper'
import { ScrapingConfig, ScraperOptions, ScrapedProduct } from '../types'

export class AliExpressScraper extends BaseScraper {
  constructor(config: ScrapingConfig, options: ScraperOptions = {}) {
    super('aliexpress', config, options)
  }

  /**
   * Get URLs to scrape from AliExpress
   */
  protected async getUrlsToScrape(): Promise<string[]> {
    const urls: string[] = []

    for (const pattern of this.config.urlPatterns) {
      if (pattern.startsWith('http')) {
        urls.push(pattern)
      }
    }

    return urls
  }

  /**
   * Extract products from an AliExpress page
   */
  protected async extractProductsFromPage(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = []

    try {
      // AliExpress uses dynamic content, wait for it
      await this.page!.waitForTimeout(3000)

      // Try multiple selector patterns
      const productElements = await this.page!.$$(
        '.product-item, .product-card, .list-item, [class*="product-card"], [class*="product-item"]'
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

    // Extract product ID
    const productIdMatch = productUrl.match(/\/(\d+)\.html/) || productUrl.match(/item\/(\d+)/)
    const productId = productIdMatch ? `ALI-${productIdMatch[1]}` : `ALI-${Date.now()}`

    // Extract title
    const titleElement = await element.$('.title, .product-title, h3, h4, [class*="title"]')
    const title = titleElement
      ? await titleElement.textContent()
      : null

    if (!title) return null

    // Extract price
    const priceElement = await element.$('.price, .product-price, [class*="price"], .value')
    const priceText = priceElement
      ? await priceElement.textContent()
      : null
    const price = priceText ? this.extractNumber(priceText) : null

    // Extract original price
    const originalPriceElement = await element.$('.original-price, .market-price, del, [class*="original"]')
    const originalPriceText = originalPriceElement
      ? await originalPriceElement.textContent()
      : null
    const originalPrice = originalPriceText ? this.extractNumber(originalPriceText) : null

    // Extract rating
    const ratingElement = await element.$('.rating, [class*="rating"], [class*="star"]')
    const ratingText = ratingElement
      ? await ratingElement.textContent()
      : null
    const productRating = ratingText ? this.extractNumber(ratingText) : null

    // Extract review count
    const reviewElement = await element.$('[class*="review"], [class*="order"]')
    const reviewText = reviewElement
      ? await reviewElement.textContent()
      : null
    const reviewCount = reviewText ? parseInt(reviewText.replace(/\D/g, '')) || 0 : 0

    // Extract image
    const imageElement = await element.$('img[src]')
    const imageUrl = imageElement
      ? await imageElement.getAttribute('src')
      : null

    return {
      productId,
      productUrl: productUrl.startsWith('http') ? productUrl : `https://aliexpress.com${productUrl}`,
      title: title.trim(),
      price,
      originalPrice,
      currency: 'USD',
      productRating,
      reviewCount,
      imagesUrls: imageUrl ? [imageUrl] : undefined,
      platformSource: 'AliExpress',
    }
  }
}
