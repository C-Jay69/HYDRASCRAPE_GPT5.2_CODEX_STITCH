import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraping/configs/[id] - Get a specific configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await db.scrapingConfig.findUnique({
      where: { id: params.id },
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields for response
    const responseConfig = {
      ...config,
      urlPatterns: JSON.parse(config.urlPatterns),
      selectors: config.selectors ? JSON.parse(config.selectors) : null,
    }

    return NextResponse.json(responseConfig)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

// PUT /api/scraping/configs/[id] - Update a configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.platform !== undefined) updateData.platform = body.platform
    if (body.urlPatterns !== undefined) updateData.urlPatterns = JSON.stringify(body.urlPatterns)
    if (body.rateLimit !== undefined) updateData.rateLimit = body.rateLimit
    if (body.proxyRotation !== undefined) updateData.proxyRotation = body.proxyRotation
    if (body.javascriptRender !== undefined) updateData.javascriptRender = body.javascriptRender
    if (body.maxRetries !== undefined) updateData.maxRetries = body.maxRetries
    if (body.timeoutSeconds !== undefined) updateData.timeoutSeconds = body.timeoutSeconds
    if (body.captchaHandling !== undefined) updateData.captchaHandling = body.captchaHandling
    if (body.maxProducts !== undefined) updateData.maxProducts = body.maxProducts
    if (body.robotsCompliance !== undefined) updateData.robotsCompliance = body.robotsCompliance
    if (body.selectors !== undefined) updateData.selectors = body.selectors ? JSON.stringify(body.selectors) : null

    const config = await db.scrapingConfig.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}

// DELETE /api/scraping/configs/[id] - Delete a configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.scrapingConfig.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Configuration deleted successfully' })
  } catch (error) {
    console.error('Error deleting config:', error)
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    )
  }
}
