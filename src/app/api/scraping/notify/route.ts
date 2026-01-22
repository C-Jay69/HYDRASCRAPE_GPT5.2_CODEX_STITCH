import { NextRequest, NextResponse } from 'next/server'

// POST /api/scraping/notify - Send notification to clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, jobId, data } = body

    // This endpoint can be used by the job manager to send notifications
    // For now, we'll return success as the actual WebSocket broadcasting
    // would be handled by the WebSocket service

    console.log(`Notification received: ${type} for job ${jobId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
