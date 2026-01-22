import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const PORT = 3003

const httpServer = createServer()
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Store active subscriptions
const jobSubscriptions = new Map<string, Set<string>>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Subscribe to job updates
  socket.on('subscribe:job', (jobId: string) => {
    console.log(`Client ${socket.id} subscribing to job ${jobId}`)

    if (!jobSubscriptions.has(jobId)) {
      jobSubscriptions.set(jobId, new Set())
    }
    jobSubscriptions.get(jobId)!.add(socket.id)
    socket.join(`job:${jobId}`)

    // Send initial job status
    sendJobStatus(socket, jobId)
  })

  // Unsubscribe from job updates
  socket.on('unsubscribe:job', (jobId: string) => {
    console.log(`Client ${socket.id} unsubscribing from job ${jobId}`)

    const subs = jobSubscriptions.get(jobId)
    if (subs) {
      subs.delete(socket.id)
      if (subs.size === 0) {
        jobSubscriptions.delete(jobId)
      }
    }
    socket.leave(`job:${jobId}`)
  })

  // Subscribe to all jobs
  socket.on('subscribe:all', () => {
    console.log(`Client ${socket.id} subscribing to all jobs`)
    socket.join('all-jobs')

    // Send recent jobs
    sendRecentJobs(socket)
  })

  // Unsubscribe from all jobs
  socket.on('unsubscribe:all', () => {
    console.log(`Client ${socket.id} unsubscribing from all jobs`)
    socket.leave('all-jobs')
  })

  // Request job details
  socket.on('get:job', async (jobId: string) => {
    try {
      const job = await prisma.scrapeJob.findUnique({
        where: { id: jobId },
        include: {
          products: {
            take: 20,
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

      if (job) {
        socket.emit('job:details', job)
      } else {
        socket.emit('error', { message: 'Job not found' })
      }
    } catch (error) {
      console.error('Error getting job details:', error)
      socket.emit('error', { message: 'Failed to get job details' })
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)

    // Remove client from all subscriptions
    for (const [jobId, subs] of jobSubscriptions.entries()) {
      subs.delete(socket.id)
      if (subs.size === 0) {
        jobSubscriptions.delete(jobId)
      }
    }
  })
})

/**
 * Send job status to a socket
 */
async function sendJobStatus(socket: any, jobId: string) {
  try {
    const job = await prisma.scrapeJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        platform: true,
        status: true,
        progress: true,
        productsScraped: true,
        productsFailed: true,
        captchaEvents: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        error: true,
      },
    })

    if (job) {
      socket.emit('job:status', job)
    }
  } catch (error) {
    console.error('Error sending job status:', error)
  }
}

/**
 * Send recent jobs to a socket
 */
async function sendRecentJobs(socket: any) {
  try {
    const jobs = await prisma.scrapeJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        platform: true,
        status: true,
        progress: true,
        productsScraped: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
      },
    })

    socket.emit('jobs:recent', jobs)
  } catch (error) {
    console.error('Error sending recent jobs:', error)
  }
}

/**
 * Broadcast job update to all subscribed clients
 */
export function broadcastJobUpdate(jobId: string, data: any) {
  io.to(`job:${jobId}`).emit('job:update', { jobId, ...data })
  io.to('all-jobs').emit('job:update', { jobId, ...data })
}

/**
 * Broadcast job log to all subscribed clients
 */
export function broadcastJobLog(jobId: string, level: string, message: string, details?: any) {
  io.to(`job:${jobId}`).emit('job:log', {
    jobId,
    level,
    message,
    details,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Broadcast job completion to all subscribed clients
 */
export function broadcastJobComplete(jobId: string, success: boolean) {
  io.to(`job:${jobId}`).emit('job:complete', { jobId, success })
  io.to('all-jobs').emit('job:complete', { jobId, success })
}

// Make functions available globally for external access
(global as any).broadcastJobUpdate = broadcastJobUpdate
(global as any).broadcastJobLog = broadcastJobLog
(global as any).broadcastJobComplete = broadcastJobComplete

// Start server
httpServer.listen(PORT, () => {
  console.log(`Scraping WebSocket service running on port ${PORT}`)
})
