import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ScrapingConfig } from '@/lib/scraping/types'

// GET /api/scraping/jobs - List all jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) where.status = status
    if (platform) where.platform = platform

    const jobs = await db.scrapeJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        products: {
          take: 5,
          orderBy: { dateScraped: 'desc' },
        },
        _count: {
          select: {
            products: true,
            logs: true,
          },
        },
      },
    })

    const total = await db.scrapeJob.count({ where })

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/scraping/jobs - Create a new scraping job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, config, configId } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    let configData = config

    // If configId is provided, load the config from database
    if (configId) {
      const savedConfig = await db.scrapingConfig.findUnique({
        where: { id: configId },
      })
      if (savedConfig) {
        configData = {
          urlPatterns: JSON.parse(savedConfig.urlPatterns),
          rateLimit: savedConfig.rateLimit,
          proxyRotation: savedConfig.proxyRotation,
          javascriptRender: savedConfig.javascriptRender,
          maxRetries: savedConfig.maxRetries,
          timeoutSeconds: savedConfig.timeoutSeconds,
          captchaHandling: savedConfig.captchaHandling,
          maxProducts: savedConfig.maxProducts,
          robotsCompliance: savedConfig.robotsCompliance,
          selectors: savedConfig.selectors ? JSON.parse(savedConfig.selectors) : undefined,
        }
      }
    }

    // Default config if none provided
    if (!configData) {
      configData = {
        maxProducts: 100,
        rateLimit: 2,
        proxyRotation: true,
        javascriptRender: true,
        maxRetries: 5,
        timeoutSeconds: 30,
        captchaHandling: 'pause',
        robotsCompliance: true,
      }
    }

    const job = await db.scrapeJob.create({
      data: {
        platform,
        status: 'queued',
        config: JSON.stringify(configData),
      },
    })

    // Trigger the scraping job asynchronously
    // For now, create the job and mark it as queued
    // In production, this would trigger a background worker

    // Start scraping in background (simplified version)
    setTimeout(async () => {
      try {
        await db.scrapeJob.update({
          where: { id: job.id },
          data: { status: 'running', startedAt: new Date() },
        })

        // Simulate scraping for now - in production, use actual scraper
        for (let i = 1; i <= 100; i++) {
          await new Promise(resolve => setTimeout(resolve, 100))
          const progress = Math.floor(i)

          await db.scrapeJob.update({
            where: { id: job.id },
            data: { progress, productsScraped: Math.floor(progress * 1.2) },
          })
        }

        await db.scrapeJob.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
          },
        })
      } catch (error) {
        console.error('Error in scraping job:', error)
        await db.scrapeJob.update({
          where: { id: job.id },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date(),
          },
        })
      }
    }, 1000)

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
