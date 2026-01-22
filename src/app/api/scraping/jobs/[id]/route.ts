import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraping/jobs/[id] - Get a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.scrapeJob.findUnique({
      where: { id: params.id },
      include: {
        products: {
          take: 20,
          skip: 0,
          orderBy: { dateScraped: 'desc' },
        },
        logs: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
        _count: {
          select: {
            products: true,
            logs: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// DELETE /api/scraping/jobs/[id] - Cancel/delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.scrapeJob.findUnique({
      where: { id: params.id },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // If job is queued or running, mark it as cancelled
    if (job.status === 'queued' || job.status === 'running') {
      await db.scrapeJob.update({
        where: { id: params.id },
        data: {
          status: 'cancelled',
          completedAt: new Date(),
        },
      })

      await db.scrapingLog.create({
        data: {
          jobId: params.id,
          level: 'info',
          message: 'Job was cancelled by user',
        },
      })

      return NextResponse.json({ message: 'Job cancelled successfully' })
    }

    // Job is already completed or cancelled
    return NextResponse.json(
      { error: 'Cannot cancel a job that is not queued or running' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error cancelling job:', error)
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    )
  }
}
