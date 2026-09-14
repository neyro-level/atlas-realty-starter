import type { Payload, PayloadRequest } from 'payload'

import { systemContext } from '../operations'

const RECOVERY_LIMIT = 200
const PROCESSING_TIMEOUT_MS = 10 * 60_000

export async function recoverLeadDeliveries(payload: Payload, req?: PayloadRequest) {
  const now = new Date()
  const stale = new Date(now.getTime() - PROCESSING_TIMEOUT_MS).toISOString()
  const result = await payload.find({
    collection: 'lead-deliveries', depth: 0, limit: RECOVERY_LIMIT, overrideAccess: true, req,
    sort: 'createdAt',
    where: { or: [
      { and: [{ status: { in: ['pending', 'failed'] } }, { nextAttemptAt: { less_than_equal: now.toISOString() } }] },
      { and: [{ status: { in: ['pending', 'failed'] } }, { nextAttemptAt: { exists: false } }] },
      { and: [{ status: { equals: 'processing' } }, { lockedAt: { less_than_equal: stale } }] },
    ] },
  })

  for (const delivery of result.docs) {
    if (delivery.status === 'processing') {
      await payload.update({
        collection: 'lead-deliveries', context: systemContext('lead-recovery'),
        data: { lastError: 'processing_timeout', lockedAt: null, status: 'failed' }, depth: 0,
        id: delivery.id, overrideAccess: true, overrideLock: true, req,
      })
    }
    await payload.jobs.queue({
      input: { deliveryId: String(delivery.id) }, overrideAccess: true, queue: 'lead-deliveries', req,
      task: 'deliverLead',
    })
  }
  return { queued: result.docs.length }
}
