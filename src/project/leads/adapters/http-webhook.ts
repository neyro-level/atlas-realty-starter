import { createHmac } from 'node:crypto'

import { safeHTTPSRequest, type SafeHTTPResponse } from '@/core/security/outbound-http/client'
import {
  LEAD_CHANNEL_IDEMPOTENCY,
  LEAD_CHANNEL_PORT_VERSION,
  type DeliveryAttempt,
  type DeliveryResult,
  type LeadChannelAdapter,
} from '@/core/ports/lead-channel'

type RequestClient = (url: string | URL, options: Parameters<typeof safeHTTPSRequest>[1]) => Promise<SafeHTTPResponse>

export function createHTTPWebhookAdapter(config: {
  allowHosts: readonly string[]
  endpoint: string
  headers?: Readonly<Record<string, string>>
  mapPayload: (attempt: DeliveryAttempt) => unknown
  secret: string
  timeoutMs: number
}, requestClient: RequestClient = safeHTTPSRequest): LeadChannelAdapter {
  return {
    idempotency: LEAD_CHANNEL_IDEMPOTENCY,
    version: LEAD_CHANNEL_PORT_VERSION,
    async deliver(attempt): Promise<DeliveryResult> {
      const body = JSON.stringify(config.mapPayload(attempt))
      const signature = createHmac('sha256', config.secret).update(body).digest('hex')
      try {
        const response = await requestClient(config.endpoint, {
          allowErrorStatus: true,
          allowHosts: config.allowHosts,
          body,
          headers: {
            'content-type': 'application/json',
            'idempotency-key': attempt.idempotencyKey,
            'x-webhook-signature': `sha256=${signature}`,
            ...config.headers,
          },
          maxBytes: 64 * 1024,
          maxRedirects: 0,
          method: 'POST',
          timeoutMs: config.timeoutMs,
        })
        if (response.status >= 200 && response.status < 300) return { ok: true }
        const retryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500
        return { code: `http_${response.status}`, kind: retryable ? 'retryable' : 'permanent', ok: false }
      } catch {
        return { code: 'network_error', kind: 'retryable', ok: false }
      }
    },
  }
}
