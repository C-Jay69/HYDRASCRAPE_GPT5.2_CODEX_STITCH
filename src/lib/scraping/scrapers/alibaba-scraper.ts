import { BaseScraper } from '../base-scraper'
import { ScrapingConfig, ScraperOptions, ScrapedProduct } from '../types'

export class AlibabaScraper extends BaseScraper {
  constructor(config: ScrapingConfig, options: ScraperOptions = {}) {
    super('alibaba', config, options)
  }

  /**
   * Get URLs to scrape from Alibaba
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
   * Extract products from an Alibaba page
   */
  protected async extractProductsFromPage(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = []

    try {
      // Wait for content to load
      await this.page!.waitForTimeout(2000)

      // Find product elements
      const productElements = await this.page!.$$(
        '.product-item, .product-card, .offer-item, [class*="product"], [class*="offer"]'
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
    const productIdMatch = productUrl.match(/\/(\d+)\.html/) || productUrl.match(/product\/(\d+)/)
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

    // Extract MOQ (Minimum Order Quantity)
    const moqElement = await element.$('[class*="moq"], [class*="order"], [class*="min"]')
    const moqText = moqElement
      ? await moqElement.textContent()
      : null
    const minimumOrderQuantity = moqText ? parseInt(moqText.replace(/\D/g, '')) || 1 : 1

    // Extract image
    const imageElement = await element.$('img[src]')
    const imageUrl = imageElement
      ? await imageElement.getAttribute('src')
      : null

    return {
      productId,
      productUrl: productUrl.startsWith('http') ? productUrl : `https://alibaba.com${productUrl}`,
      title: title.trim(),
      price,
      currency: 'USD',
      minimumOrderQuantity,
      imagesUrls: imageUrl ? [imageUrl] : undefined,
      platformSource: 'Alibaba',
    }
  }
}
