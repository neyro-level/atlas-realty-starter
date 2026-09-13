import type { Payload } from 'payload'

const STUCK_AFTER_MS = 10 * 60_000
const OLD_PENDING_AFTER_MS = 5 * 60_000

export type LeadDeliveryHealth = {
  alerts: string[]
  dead: number
  failed: number
  oldestPendingSeconds: number | null
  stuckProcessing: number
}

export async function getLeadDeliveryHealth(payload: Payload, now = Date.now()): Promise<LeadDeliveryHealth> {
  const stuckCutoff = new Date(now - STUCK_AFTER_MS).toISOString()
  const [dead, failed, stuck, oldest] = await Promise.all([
    payload.count({ collection: 'lead-deliveries', overrideAccess: true, where: { status: { equals: 'dead' } } }),
    payload.count({ collection: 'lead-deliveries', overrideAccess: true, where: { status: { equals: 'failed' } } }),
    payload.count({ collection: 'lead-deliveries', overrideAccess: true, where: { and: [{ status: { equals: 'processing' } }, { lockedAt: { less_than_equal: stuckCutoff } }] } }),
    payload.find({ collection: 'lead-deliveries', depth: 0, limit: 1, overrideAccess: true, pagination: false, select: { createdAt: true }, sort: 'createdAt', where: { status: { equals: 'pending' } } }),
  ])
  const oldestCreatedAt = oldest.docs[0]?.createdAt
  const oldestPendingSeconds = oldestCreatedAt ? Math.max(0, Math.floor((now - Date.parse(oldestCreatedAt)) / 1000)) : null
  const alerts = [
    ...(dead.totalDocs > 0 ? ['dead_deliveries'] : []),
    ...(stuck.totalDocs > 0 ? ['stuck_processing'] : []),
    ...(oldestPendingSeconds !== null && oldestPendingSeconds * 1000 > OLD_PENDING_AFTER_MS ? ['pending_queue_delayed'] : []),
  ]
  return { alerts, dead: dead.totalDocs, failed: failed.totalDocs, oldestPendingSeconds, stuckProcessing: stuck.totalDocs }
}
