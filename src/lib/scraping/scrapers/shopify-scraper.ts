import { BaseScraper } from '../base-scraper'
import { ScrapingConfig, ScraperOptions, ScrapedProduct } from '../types'

export class ShopifyScraper extends BaseScraper {
  constructor(domain: string, config: ScrapingConfig, options: ScraperOptions = {}) {
    super('shopify', config, options)
    this.domain = domain
  }

  private domain: string

  /**
   * Get URLs to scrape from Shopify store
   */
  protected async getUrlsToScrape(): Promise<string[]> {
    const urls: string[] = []

    for (const pattern of this.config.urlPatterns) {
      if (pattern.startsWith('http')) {
        urls.push(pattern)
      } else {
        // Treat as relative URL
        urls.push(`https://${this.domain}${pattern}`)
      }
    }

    return urls
  }

  /**
   * Extract products from a Shopify page
   */
  protected async extractProductsFromPage(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = []

    try {
      // Wait for products to load
      await this.page!.waitForSelector('.product-item, .product-card, [class*="product-card"]', { timeout: 5000 })

      // Find product elements
      const productElements = await this.page!.$$(
        '.product-item, .product-card, [class*="product"], [class*="ProductCard"], article.product'
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
    const productIdMatch = productUrl.match(/\/products\/([^/?]+)/) || productUrl.match(/variant=([\d]+)/)
    const productId = productIdMatch ? productIdMatch[1] : `SHO-${Date.now()}`

    // Extract title
    const titleElement = await element.$('.title, .product-title, h3, h4, [class*="title"], [class*="Title"]')
    const title = titleElement
      ? await titleElement.textContent()
      : null

    if (!title) return null

    // Extract price
    const priceElement = await element.$('.price, .product-price, [class*="price"], .money, [class*="Price"]')
    const priceText = priceElement
      ? await priceElement.textContent()
      : null
    const price = priceText ? this.extractNumber(priceText) : null

    // Extract original price (compare-at-price in Shopify)
    const originalPriceElement = await element.$('.compare-at-price, [class*="original"], del')
    const originalPriceText = originalPriceElement
      ? await originalPriceElement.textContent()
      : null
    const originalPrice = originalPriceText ? this.extractNumber(originalPriceText) : null

    // Extract vendor
    const vendorElement = await element.$('.vendor, [class*="vendor"], [class*="Vendor"]')
    const vendorName = vendorElement
      ? await vendorElement.textContent()
      : null

    // Extract image
    const imageElement = await element.$('img[src]')
    const imageUrl = imageElement
      ? await imageElement.getAttribute('src')
      : null

    return {
      productId,
      productUrl: productUrl.startsWith('http') ? productUrl : `https://${this.domain}${productUrl}`,
      title: title.trim(),
      price,
      originalPrice,
      currency: 'USD',
      vendorName: vendorName?.trim(),
      imagesUrls: imageUrl ? [imageUrl] : undefined,
      platformSource: 'Shopify',
    }
  }
}
