import { runtimeConfig } from '@/project/env'
import type {
  DeliveryAttempt,
  DeliveryResult,
  LeadChannelAdapter,
} from '@/core/data-access/system/leads/delivery'

export type { DeliveryAttempt, DeliveryResult, LeadChannelAdapter }

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
