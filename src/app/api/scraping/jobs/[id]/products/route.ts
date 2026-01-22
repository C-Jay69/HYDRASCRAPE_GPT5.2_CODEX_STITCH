import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraping/jobs/[id]/products - Get products from a job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const job = await db.scrapeJob.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const products = await db.product.findMany({
      where: { jobId: params.id },
      orderBy: { dateScraped: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.product.count({
      where: { jobId: params.id },
    })

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
