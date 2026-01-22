import EventEmitter from 'events'

class NotificationEventEmitter extends EventEmitter {}

// Create a singleton event emitter for notifications
export const notificationBus = new NotificationEventEmitter()

// Event types
export const NOTIFICATION_EVENTS = {
  JOB_UPDATE: 'job:update',
  JOB_LOG: 'job:log',
  JOB_COMPLETE: 'job:complete',
  JOB_CREATED: 'job:created',
  JOB_CANCELLED: 'job:cancelled',
}

/**
 * Emit job update event
 */
export function emitJobUpdate(jobId: string, data: any) {
  notificationBus.emit(NOTIFICATION_EVENTS.JOB_UPDATE, jobId, data)
}

/**
 * Emit job log event
 */
export function emitJobLog(jobId: string, level: string, message: string, details?: any) {
  notificationBus.emit(NOTIFICATION_EVENTS.JOB_LOG, jobId, level, message, details)
}

/**
 * Emit job complete event
 */
export function emitJobComplete(jobId: string, success: boolean) {
  notificationBus.emit(NOTIFICATION_EVENTS.JOB_COMPLETE, jobId, success)
}

/**
 * Emit job created event
 */
export function emitJobCreated(jobId: string, platform: string) {
  notificationBus.emit(NOTIFICATION_EVENTS.JOB_CREATED, jobId, platform)
}

/**
 * Emit job cancelled event
 */
export function emitJobCancelled(jobId: string) {
  notificationBus.emit(NOTIFICATION_EVENTS.JOB_CANCELLED, jobId)
}
