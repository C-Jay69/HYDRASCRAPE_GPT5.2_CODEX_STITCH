import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraping/configs - List all configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    const where: any = {}
    if (platform) where.platform = platform

    const configs = await db.scrapingConfig.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    )
  }
}

// POST /api/scraping/configs - Create a new configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      platform,
      urlPatterns,
      rateLimit = 6,
      proxyRotation = true,
      javascriptRender = true,
      maxRetries = 5,
      timeoutSeconds = 30,
      captchaHandling = 'pause',
      maxProducts,
      robotsCompliance = true,
      selectors,
    } = body

    if (!name || !platform) {
      return NextResponse.json(
        { error: 'Name and platform are required' },
        { status: 400 }
      )
    }

    const config = await db.scrapingConfig.create({
      data: {
        name,
        platform,
        urlPatterns: JSON.stringify(urlPatterns || []),
        rateLimit,
        proxyRotation,
        javascriptRender,
        maxRetries,
        timeoutSeconds,
        captchaHandling,
        maxProducts,
        robotsCompliance,
        selectors: selectors ? JSON.stringify(selectors) : null,
      },
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creating config:', error)
    return NextResponse.json(
      { error: 'Failed to create configuration' },
      { status: 500 }
    )
  }
}
