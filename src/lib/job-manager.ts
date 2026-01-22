import { db } from '@/lib/db'
import { createScraper, validateScrapingConfig } from '@/lib/scraping'
import { ScrapingConfig } from '@/lib/scraping/types'
import { emitJobUpdate, emitJobLog, emitJobComplete, emitJobCreated, emitJobCancelled } from '@/lib/notifications'

interface JobManagerOptions {
  onUpdate?: (jobId: string, progress: number, productsScraped: number) => void
  onLog?: (jobId: string, level: string, message: string, details?: any) => void
  onComplete?: (jobId: string, success: boolean) => void
}

class JobManager {
  private activeJobs = new Map<string, boolean>()
  private options: JobManagerOptions

  constructor(options: JobManagerOptions = {}) {
    this.options = options
  }

  /**
   * Start a scraping job
   */
  async startJob(jobId: string, platform: string, config: ScrapingConfig): Promise<void> {
    if (this.activeJobs.has(jobId)) {
      throw new Error('Job is already running')
    }

    // Validate config
    const validation = validateScrapingConfig(config)
    if (!validation.valid) {
      throw new Error(`Invalid config: ${validation.errors.join(', ')}`)
    }

    this.activeJobs.set(jobId, true)

    try {
      // Emit job created event
      emitJobCreated(jobId, platform)

      // Update job status to running
      await db.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: 'running',
          startedAt: new Date(),
          progress: 0,
        },
      })

      // Emit job update
      emitJobUpdate(jobId, { status: 'running', progress: 0 })

      this.log(jobId, 'info', `Starting scraping job for platform: ${platform}`)

      // Create scraper instance
      const scraper = createScraper(platform, config, {
        onProgress: (progress, productsScraped) => {
          this.handleProgress(jobId, progress, productsScraped)
        },
        onLog: (level, message, details) => {
          this.handleLog(jobId, level, message, details)
        },
        onCancel: () => {
          return !this.activeJobs.has(jobId)
        },
      })

      // Run the scraper
      const result = await scraper.run()

      // Save products to database
      await this.saveProducts(jobId, platform, result.products)

      // Update job status
      await db.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: result.success ? 'completed' : 'failed',
          progress: 100,
          productsScraped: result.products.length,
          productsFailed: result.errors.length,
          captchaEvents: result.captchaEvents,
          error: result.errors.length > 0 ? result.errors.join('; ') : null,
          completedAt: new Date(),
        },
      })

      this.log(jobId, 'info', `Job completed. Success: ${result.success}, Products: ${result.products.length}`)

      // Emit job complete event
      emitJobComplete(jobId, result.success)

      // Notify completion
      if (this.options.onComplete) {
        this.options.onComplete(jobId, result.success)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await db.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: errorMessage,
          completedAt: new Date(),
        },
      })

      this.log(jobId, 'error', `Job failed: ${errorMessage}`)

      // Emit job complete event with failure
      emitJobComplete(jobId, false)

      if (this.options.onComplete) {
        this.options.onComplete(jobId, false)
      }

      throw error
    } finally {
      this.activeJobs.delete(jobId)
    }
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<void> {
    if (!this.activeJobs.has(jobId)) {
      throw new Error('Job is not running')
    }

    this.activeJobs.delete(jobId)

    await db.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    })

    this.log(jobId, 'info', 'Job cancelled by user')

    // Emit job cancelled event
    emitJobCancelled(jobId)

    if (this.options.onComplete) {
      this.options.onComplete(jobId, false)
    }
  }

  /**
   * Check if a job is running
   */
  isJobRunning(jobId: string): boolean {
    return this.activeJobs.has(jobId)
  }

  /**
   * Get all active job IDs
   */
  getActiveJobs(): string[] {
    return Array.from(this.activeJobs.keys())
  }

  /**
   * Handle progress updates from scraper
   */
  private async handleProgress(jobId: string, progress: number, productsScraped: number): Promise<void> {
    try {
      await db.scrapeJob.update({
        where: { id: jobId },
        data: {
          progress,
          productsScraped,
        },
      })

      // Emit job update
      emitJobUpdate(jobId, { progress, productsScraped })

      if (this.options.onUpdate) {
        this.options.onUpdate(jobId, progress, productsScraped)
      }
    } catch (error) {
      console.error('Error updating job progress:', error)
    }
  }

  /**
   * Handle log messages from scraper
   */
  private async handleLog(jobId: string, level: string, message: string, details?: any): Promise<void> {
    try {
      await db.scrapingLog.create({
        data: {
          jobId,
          level,
          message,
          details: details ? JSON.stringify(details) : null,
        },
      })

      // Emit job log
      emitJobLog(jobId, level, message, details)

      if (this.options.onLog) {
        this.options.onLog(jobId, level, message, details)
      }
    } catch (error) {
      console.error('Error saving log:', error)
    }
  }

  /**
   * Log a message
   */
  private async log(jobId: string, level: string, message: string, details?: any): Promise<void> {
    await this.handleLog(jobId, level, message, details)
  }

  /**
   * Save products to database
   */
  private async saveProducts(jobId: string, platform: string, products: any[]): Promise<void> {
    const batchSize = 50
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      await db.product.createMany({
        data: batch.map(product => ({
          jobId,
          platform,
          productId: product.productId,
          productUrl: product.productUrl,
          title: product.title,
          description: product.description,
          mainCategory: product.mainCategory,
          subCategory: product.subCategory,
          price: product.price,
          originalPrice: product.originalPrice,
          currency: product.currency,
          shippingCost: product.shippingCost,
          shippingTimeEstimate: product.shippingTimeEstimate,
          vendorName: product.vendorName,
          vendorRating: product.vendorRating,
          productRating: product.productRating,
          reviewCount: product.reviewCount,
          imagesUrls: product.imagesUrls ? JSON.stringify(product.imagesUrls) : null,
          variantOptions: product.variantOptions,
          stockStatus: product.stockStatus,
          minimumOrderQuantity: product.minimumOrderQuantity,
          weight: product.weight,
          dimensions: product.dimensions,
          sku: product.sku,
          platformSource: product.platformSource,
        })),
        skipDuplicates: true,
      })

      // Log progress
      this.log(jobId, 'info', `Saved ${Math.min(i + batchSize, products.length)}/${products.length} products`)
    }
  }
}

// Singleton instance
export const jobManager = new JobManager()
