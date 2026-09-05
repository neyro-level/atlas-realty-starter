import type { Payload, PayloadRequest } from 'payload'

import { getLeadChannelAdapter } from '@/project/leads/channels'

import { systemContext } from '../operations'

const MAX_ATTEMPTS = 5
const BASE_BACKOFF_MS = 30_000

export type DeliveryProcessResult = { status: 'dead' | 'delivered' | 'failed' | 'skipped' }

export async function processLeadDelivery(payload: Payload, deliveryId: string, req?: PayloadRequest): Promise<DeliveryProcessResult> {
  const delivery = await payload.findByID({
    collection: 'lead-deliveries', depth: 0, id: deliveryId, overrideAccess: true, req,
  })
  if (delivery.status === 'delivered' || delivery.status === 'dead' || delivery.status === 'processing') return { status: 'skipped' }
  if (delivery.nextAttemptAt && Date.parse(delivery.nextAttemptAt) > Date.now()) return { status: 'skipped' }
  const attempt = delivery.attempts + 1
  if (attempt > MAX_ATTEMPTS) {
    await setDelivery(payload, deliveryId, { lockedAt: null, status: 'dead' }, req)
    return { status: 'dead' }
  }

  await setDelivery(payload, deliveryId, {
    attempts: attempt,
    lastAttemptAt: new Date().toISOString(),
    lastError: null,
    lockedAt: new Date().toISOString(),
    status: 'processing',
  }, req)

  const adapter = getLeadChannelAdapter(delivery.channel)
  const result = adapter
    ? await safeDeliver(adapter, { attempt, deliveryId, idempotencyKey: delivery.idempotencyKey, leadId: relationID(delivery.lead) })
    : { code: 'channel_unavailable', kind: 'permanent' as const, ok: false as const }

  if (result.ok) {
    await setDelivery(payload, deliveryId, {
      deliveredAt: new Date().toISOString(), lastError: null, lockedAt: null, nextAttemptAt: null, status: 'delivered',
    }, req)
    return { status: 'delivered' }
  }

  const dead = result.kind === 'permanent' || attempt >= MAX_ATTEMPTS
  const nextAttemptAt = dead ? null : new Date(Date.now() + retryDelay(attempt)).toISOString()
  await setDelivery(payload, deliveryId, {
    lastError: redactDeliveryError(result.code), lockedAt: null, nextAttemptAt, status: dead ? 'dead' : 'failed',
  }, req)
  if (!dead && nextAttemptAt) {
    await payload.jobs.queue({
      input: { deliveryId }, overrideAccess: true, queue: 'lead-deliveries', req,
      task: 'deliverLead', waitUntil: new Date(nextAttemptAt),
    })
  }
  return { status: dead ? 'dead' : 'failed' }
}

export function retryDelay(attempt: number) {
  return Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempt - 1), 30 * 60_000)
}

export function redactDeliveryError(value: string) {
  return value.replace(/https?:\/\/\S+|[\w.+-]+@[\w.-]+|\+?\d[\d\s()-]{7,}\d/g, '[redacted]').slice(0, 200)
}

async function safeDeliver(adapter: NonNullable<ReturnType<typeof getLeadChannelAdapter>>, input: Parameters<NonNullable<ReturnType<typeof getLeadChannelAdapter>>['deliver']>[0]) {
  try {
    return await adapter.deliver(input)
  } catch {
    return { code: 'network_error', kind: 'retryable' as const, ok: false as const }
  }
}

async function setDelivery(payload: Payload, id: string, data: Record<string, unknown>, req?: PayloadRequest) {
  return payload.update({
    collection: 'lead-deliveries', context: systemContext('lead-delivery'), data, depth: 0, id,
    overrideAccess: true, overrideLock: false, req,
  })
}

function relationID(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  throw new Error('lead_delivery_missing_lead')
}
