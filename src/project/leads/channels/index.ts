import { runtimeConfig } from '@/project/env'

export type DeliveryAttempt = {
  attempt: number
  deliveryId: string
  idempotencyKey: string
  leadId: string
}

export type DeliveryResult =
  | { ok: true }
  | { code: 'http_429' | 'http_5xx' | 'network_error' | 'timeout'; kind: 'retryable'; ok: false }
  | { code: 'rejected'; kind: 'permanent'; ok: false }

export interface LeadChannelAdapter {
  deliver(attempt: DeliveryAttempt): Promise<DeliveryResult>
}

const testAdapter: LeadChannelAdapter = {
  async deliver(attempt) {
    if (attempt.deliveryId.startsWith('test-permanent:')) return { code: 'rejected', kind: 'permanent', ok: false }
    if (attempt.deliveryId.startsWith('test-retryable:') && attempt.attempt === 1) return { code: 'timeout', kind: 'retryable', ok: false }
    return { ok: true }
  },
}

export function getLeadChannelAdapter(channel: string): LeadChannelAdapter | undefined {
  if (runtimeConfig.environment !== 'test') return undefined
  return channel.startsWith('test-') ? {
    deliver: (attempt) => testAdapter.deliver({ ...attempt, deliveryId: `${channel}:${attempt.deliveryId}` }),
  } : undefined
}
