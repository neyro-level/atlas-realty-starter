import {
  LEAD_CHANNEL_PORT_VERSION,
  type LeadChannelAdapter,
  type LeadChannelBinding,
  type LeadChannelPolicy,
} from '@/core/ports/lead-channel'
import { runtimeConfig } from '@/project/env'
import { tenantLeadChannels, tenantLeadDelivery } from '@/project/tenant.config'

import { createHTTPWebhookAdapter } from './adapters/http-webhook'

const DEFAULT_POLICY: LeadChannelPolicy = tenantLeadDelivery['ams-leads']
const UNAVAILABLE_POLICY: LeadChannelPolicy = { ...DEFAULT_POLICY, maxAttempts: 3 }

const testAdapter: LeadChannelAdapter = {
  version: LEAD_CHANNEL_PORT_VERSION,
  async deliver(attempt) {
    if (attempt.deliveryId.startsWith('test-permanent:')) return { code: 'rejected', kind: 'permanent', ok: false }
    if (attempt.deliveryId.startsWith('test-retryable:') && attempt.attempt === 1) return { code: 'timeout', kind: 'retryable', ok: false }
    return { ok: true }
  },
}

function createAmsLeadsBinding(): LeadChannelBinding {
  const config = runtimeConfig.amsLeads
  if (!config) return { policy: UNAVAILABLE_POLICY }
  const endpointHost = new URL(config.apiURL).hostname.toLowerCase()
  if (!runtimeConfig.leadOutboundHosts.includes(endpointHost)) return { policy: UNAVAILABLE_POLICY }
  return {
    policy: DEFAULT_POLICY,
    adapter: createHTTPWebhookAdapter({
      allowHosts: runtimeConfig.leadOutboundHosts,
      endpoint: config.apiURL,
      headers: { 'x-ams-site-key': config.siteKey },
      secret: config.siteKey,
      timeoutMs: DEFAULT_POLICY.timeoutMs,
      mapPayload: (attempt) => ({
        project: config.projectId,
        siteLeadId: attempt.leadId,
        form: attempt.lead.propertyId ? 'property' : 'general',
        name: attempt.lead.name?.trim() || 'Клиент Atlas',
        phone: attempt.lead.phone,
        email: attempt.lead.email || undefined,
        message: attempt.lead.message || undefined,
        source: new URL(attempt.lead.sourcePage || '/', runtimeConfig.siteURL).toString(),
        meta: { page_title: attempt.lead.propertyId ? 'Заявка по объекту Atlas' : 'Заявка Atlas' },
      }),
    }),
  }
}

export function getLeadChannel(channel: string): LeadChannelBinding {
  if (channel === 'ams-leads' && tenantLeadChannels.includes(channel)) return createAmsLeadsBinding()
  if (runtimeConfig.environment === 'test' && channel.startsWith('test-')) {
    return {
      policy: { ...DEFAULT_POLICY, maxAttempts: 2 },
      adapter: { version: LEAD_CHANNEL_PORT_VERSION, deliver: (attempt) => testAdapter.deliver({ ...attempt, deliveryId: `${channel}:${attempt.deliveryId}` }) },
    }
  }
  return { policy: UNAVAILABLE_POLICY }
}

/** @deprecated Use getLeadChannel. */
export const getLeadChannelAdapter = getLeadChannel

export type { DeliveryAttempt, DeliveryResult, LeadChannelAdapter } from '@/core/ports/lead-channel'
