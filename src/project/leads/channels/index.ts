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

const amsLeadsAdapter: LeadChannelAdapter = {
  async deliver(attempt) {
    const config = runtimeConfig.amsLeads
    if (!config) return { code: 'channel_unavailable', kind: 'permanent', ok: false }
    return deliverToAmsLeads(attempt, config, runtimeConfig.siteURL)
  },
}

export async function deliverToAmsLeads(
  attempt: DeliveryAttempt,
  config: { apiURL: string; projectId: string; siteKey: string },
  siteURL: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)
    try {
      const response = await fetchImpl(config.apiURL, {
        body: JSON.stringify({
          project: config.projectId,
          siteLeadId: attempt.leadId,
          form: attempt.lead.propertyId ? 'property' : 'general',
          name: attempt.lead.name?.trim() || 'Клиент Atlas',
          phone: attempt.lead.phone,
          email: attempt.lead.email || undefined,
          message: attempt.lead.message || undefined,
          source: new URL(attempt.lead.sourcePage || '/', siteURL).toString(),
          meta: { page_title: attempt.lead.propertyId ? 'Заявка по объекту Atlas' : 'Заявка Atlas' },
        }),
        headers: {
          'content-type': 'application/json',
          'idempotency-key': attempt.idempotencyKey,
          'x-ams-site-key': config.siteKey,
        },
        method: 'POST',
        signal: controller.signal,
      })
      if (response.ok) return { ok: true }
      return response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500
        ? { code: `http_${response.status}`, kind: 'retryable', ok: false }
        : { code: `http_${response.status}`, kind: 'permanent', ok: false }
    } catch {
      return { code: 'network_error', kind: 'retryable', ok: false }
    } finally {
      clearTimeout(timeout)
    }
}

export function getLeadChannelAdapter(channel: string): LeadChannelAdapter | undefined {
  if (channel === 'ams-leads') return amsLeadsAdapter
  if (runtimeConfig.environment !== 'test') return undefined
  return channel.startsWith('test-') ? {
    deliver: (attempt) => testAdapter.deliver({ ...attempt, deliveryId: `${channel}:${attempt.deliveryId}` }),
  } : undefined
}
