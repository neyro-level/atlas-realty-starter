import type { Payload, PayloadRequest } from 'payload'

import type {
  DeliveryLeadSnapshot,
  LeadChannelAdapter,
  LeadChannelPolicy,
  ResolveLeadChannel,
} from '@/core/ports/lead-channel'
import { LEAD_CHANNEL_IDEMPOTENCY } from '@/core/ports/lead-channel'
import type { LeadDelivery } from '@/payload-types'

import { systemContext } from '../operations'

const STALE_LOCK_MS = 10 * 60_000

export type DeliveryProcessResult = { status: 'dead' | 'delivered' | 'failed' | 'skipped' }
export type { DeliveryAttempt, DeliveryLeadSnapshot, DeliveryResult, LeadChannelAdapter } from '@/core/ports/lead-channel'

export async function processLeadDelivery(
  payload: Payload,
  deliveryId: string,
  resolveChannel: ResolveLeadChannel,
  req?: PayloadRequest,
): Promise<DeliveryProcessResult> {
  const snapshot = await payload.findByID({ collection: 'lead-deliveries', depth: 0, id: deliveryId, overrideAccess: true, req })
  const binding = resolveChannel(snapshot.channel)
  const claim = await claimDelivery(payload, snapshot, binding.policy, req)
  if (!claim) return { status: 'skipped' }

  let completed = false
  try {
    const leadId = relationID(claim.lead)
    const lead = await loadLeadSnapshot(payload, leadId, req)
    const result = binding.adapter
      ? await safeDeliver(binding.adapter, {
          attempt: claim.attempts,
          deliveryId,
          idempotencyKey: claim.idempotencyKey,
          lead,
          leadId,
        })
      : { code: 'channel_unavailable', kind: 'retryable' as const, ok: false as const }

    if (!binding.adapter) {
      payload.logger.error({ channel: claim.channel, deliveryId }, 'lead_delivery_channel_unavailable')
    }

    if (result.ok) {
      await setDelivery(payload, deliveryId, {
        deliveredAt: new Date().toISOString(), lastError: null, lockedAt: null, nextAttemptAt: null, status: 'delivered',
      }, req)
      completed = true
      return { status: 'delivered' }
    }

    const status = await failDelivery(payload, claim.attempts, binding.policy, deliveryId, result.code, result.kind, req)
    completed = true
    return { status }
  } catch (error) {
    const code = error instanceof Error ? error.message : 'delivery_processing_error'
    const status = await failDelivery(payload, claim.attempts, binding.policy, deliveryId, code, 'retryable', req)
    completed = true
    return { status }
  } finally {
    if (!completed) {
      await releaseProcessingLock(payload, deliveryId, req)
    }
  }
}

async function claimDelivery(payload: Payload, delivery: LeadDelivery, policy: LeadChannelPolicy, req?: PayloadRequest) {
  if (delivery.status === 'delivered' || delivery.status === 'dead') return null
  const now = Date.now()
  if (delivery.nextAttemptAt && Date.parse(delivery.nextAttemptAt) > now) return null
  if (delivery.status === 'processing' && (!delivery.lockedAt || Date.parse(delivery.lockedAt) > now - STALE_LOCK_MS)) return null
  const attempt = Number(delivery.attempts) + 1
  if (attempt > policy.maxAttempts) {
    await setDelivery(payload, String(delivery.id), { lockedAt: null, nextAttemptAt: null, status: 'dead' }, req)
    return null
  }

  const allowedStatus = delivery.status === 'processing' ? 'processing' : delivery.status
  const claimed = await payload.update({
    collection: 'lead-deliveries',
    context: systemContext('lead-delivery'),
    data: { attempts: attempt, lastAttemptAt: new Date(now).toISOString(), lastError: null, lockedAt: new Date(now).toISOString(), status: 'processing' },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    overrideLock: true,
    req,
    where: { and: [
      { id: { equals: delivery.id } },
      { attempts: { equals: delivery.attempts } },
      { status: { equals: allowedStatus } },
      ...(allowedStatus === 'processing' ? [{ lockedAt: { less_than_equal: new Date(now - STALE_LOCK_MS).toISOString() } }] : []),
    ] },
  })
  return claimed.docs[0] ?? null
}

async function failDelivery(
  payload: Payload,
  attempt: number,
  policy: LeadChannelPolicy,
  deliveryId: string,
  code: string,
  kind: 'permanent' | 'retryable',
  req?: PayloadRequest,
): Promise<'dead' | 'failed'> {
  const dead = kind === 'permanent' || attempt >= policy.maxAttempts
  const nextAttemptAt = dead ? null : new Date(Date.now() + retryDelay(attempt, policy)).toISOString()
  await setDelivery(payload, deliveryId, {
    lastError: redactDeliveryError(code), lockedAt: null, nextAttemptAt, status: dead ? 'dead' : 'failed',
  }, req)
  if (!dead && nextAttemptAt) {
    await payload.jobs.queue({
      input: { deliveryId }, overrideAccess: true, queue: 'lead-deliveries', req,
      task: 'deliverLead', waitUntil: new Date(nextAttemptAt),
    })
  }
  if (dead) payload.logger.error({ attempts: attempt, deliveryId, errorCode: redactDeliveryError(code) }, 'lead_delivery_dead')
  return dead ? 'dead' : 'failed'
}

async function releaseProcessingLock(payload: Payload, deliveryId: string, req?: PayloadRequest) {
  await payload.update({
    collection: 'lead-deliveries', context: systemContext('lead-delivery'),
    data: { lastError: 'delivery_interrupted', lockedAt: null, status: 'failed' }, depth: 0,
    limit: 1, overrideAccess: true, overrideLock: true, req,
    where: { and: [{ id: { equals: deliveryId } }, { status: { equals: 'processing' } }] },
  })
}

async function loadLeadSnapshot(payload: Payload, id: string, req?: PayloadRequest): Promise<DeliveryLeadSnapshot> {
  const lead = await payload.findByID({
    collection: 'leads', depth: 0, id, overrideAccess: true, req,
    select: { email: true, message: true, name: true, phone: true, property: true, sourcePage: true },
  })
  return { email: lead.email, message: lead.message, name: lead.name, phone: lead.phone, propertyId: relationIDOptional(lead.property), sourcePage: lead.sourcePage }
}

export function retryDelay(attempt: number, policy: Pick<LeadChannelPolicy, 'baseBackoffMs' | 'maxBackoffMs'> = { baseBackoffMs: 30_000, maxBackoffMs: 30 * 60_000 }) {
  return Math.min(policy.baseBackoffMs * 2 ** Math.max(0, attempt - 1), policy.maxBackoffMs)
}

export function redactDeliveryError(value: string) {
  return value.replace(/https?:\/\/\S+|[\w.+-]+@[\w.-]+|\+?\d[\d\s()-]{7,}\d/g, '[redacted]').slice(0, 200)
}

async function safeDeliver(adapter: LeadChannelAdapter, input: Parameters<LeadChannelAdapter['deliver']>[0]) {
  if (adapter.idempotency !== LEAD_CHANNEL_IDEMPOTENCY) {
    return { code: 'adapter_idempotency_contract_missing', kind: 'permanent' as const, ok: false as const }
  }
  try { return await adapter.deliver(input) }
  catch { return { code: 'network_error', kind: 'retryable' as const, ok: false as const } }
}

async function setDelivery(payload: Payload, id: string, data: Record<string, unknown>, req?: PayloadRequest) {
  return payload.update({ collection: 'lead-deliveries', context: systemContext('lead-delivery'), data, depth: 0, id, overrideAccess: true, overrideLock: true, req })
}

function relationID(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  throw new Error('lead_delivery_missing_lead')
}

function relationIDOptional(value: unknown) {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) return String(value.id)
  return undefined
}
