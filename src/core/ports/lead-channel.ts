export const LEAD_CHANNEL_PORT_VERSION = 'v1' as const

export type DeliveryLeadSnapshot = {
  email?: string | null
  message?: string | null
  name?: string | null
  phone: string
  propertyId?: string
  sourcePage?: string | null
}

export type DeliveryAttempt = {
  attempt: number
  deliveryId: string
  idempotencyKey: string
  lead: DeliveryLeadSnapshot
  leadId: string
}

export type DeliveryResult =
  | { ok: true }
  | { code: string; kind: 'permanent' | 'retryable'; ok: false }

export type LeadChannelAdapter = {
  readonly version: typeof LEAD_CHANNEL_PORT_VERSION
  deliver(attempt: DeliveryAttempt): Promise<DeliveryResult>
}

export type LeadChannelPolicy = {
  baseBackoffMs: number
  maxAttempts: number
  maxBackoffMs: number
  timeoutMs: number
}

export type LeadChannelBinding = {
  adapter?: LeadChannelAdapter
  policy: LeadChannelPolicy
}

export type ResolveLeadChannel = (channel: string) => LeadChannelBinding
