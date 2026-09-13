import { describe, expect, it } from 'vitest'

import { redactDeliveryError, retryDelay } from '@/core/data-access/system/leads/delivery'
import { createHTTPWebhookAdapter } from '@/project/leads/adapters/http-webhook'
import { isAllowedLeadSourcePagePath } from '@/modules/leads/source-page-policy'
import { leadSchema } from '@/modules/leads/schema'
import { LEAD_BODY_LIMIT_BYTES, assertMinimumFillTime, idempotencyKeySchema, normalizeLeadPhone, publicLeadSchema, readBoundedJSON } from '@/shared/types/public-lead'

describe('Stage 3 public lead contract', () => {
  it('accepts semantic residential-complex routes without opening arbitrary root paths', () => {
    expect(isAllowedLeadSourcePagePath('/zhk-greyd')).toBe(true)
    expect(isAllowedLeadSourcePagePath('/mikrorayon-samolyot')).toBe(true)
    expect(isAllowedLeadSourcePagePath('/external-import-123')).toBe(false)
  })

  it('delivers a bounded Atlas lead with an idempotency key and classifies failures', async () => {
    const attempt = {
      attempt: 1, deliveryId: 'delivery-1', idempotencyKey: 'lead:atlas:12345678', leadId: 'lead-1',
      lead: { name: 'Анна', phone: '+79991234567', sourcePage: '/nedvizhimost' },
    }
    const calls: Array<{ body?: Buffer | string; headers?: Readonly<Record<string, string>> }> = []
    const adapter = createHTTPWebhookAdapter({ allowHosts: ['leads.example.test'], endpoint: 'https://leads.example.test/v1/leads', mapPayload: (value) => value.lead, secret: 'test-secret', timeoutMs: 1000 }, async (_url, options) => {
      calls.push(options)
      return { body: Buffer.alloc(0), headers: {}, status: 202, url: 'https://leads.example.test/v1/leads' }
    })
    await expect(adapter.deliver(attempt)).resolves.toEqual({ ok: true })
    expect(calls[0]?.headers?.['idempotency-key']).toBe(attempt.idempotencyKey)
    expect(calls[0]?.headers?.['x-webhook-signature']).toMatch(/^sha256=/)
    expect(JSON.parse(String(calls[0]?.body))).toMatchObject({ phone: '+79991234567', sourcePage: '/nedvizhimost' })

    const statusAdapter = (status: number) => createHTTPWebhookAdapter({ allowHosts: ['leads.example.test'], endpoint: 'https://leads.example.test/v1/leads', mapPayload: (value) => value.lead, secret: 'test-secret', timeoutMs: 1000 }, async () => ({ body: Buffer.alloc(0), headers: {}, status, url: 'https://leads.example.test/v1/leads' }))
    await expect(statusAdapter(503).deliver(attempt)).resolves.toMatchObject({ kind: 'retryable' })
    await expect(statusAdapter(401).deliver(attempt)).resolves.toMatchObject({ kind: 'permanent' })
  })

  it('normalizes phone, email and requires explicit consent', () => {
    expect(normalizeLeadPhone('8 (999) 123-45-67')).toBe('+79991234567')
    expect(publicLeadSchema.parse({ consent: true, email: 'TEST@EXAMPLE.COM', formStartedAt: new Date().toISOString(), formType: 'general', phone: '+7 999 123-45-67', sourcePage: '/catalog' }).email).toBe('test@example.com')
    expect(() => publicLeadSchema.parse({ consent: false, formStartedAt: new Date().toISOString(), formType: 'general', phone: '+79991234567', sourcePage: '/' })).toThrow()
    expect(() => publicLeadSchema.parse({ company: 'bot', consent: true, formStartedAt: new Date().toISOString(), formType: 'general', phone: '+79991234567', sourcePage: '/' })).toThrow()
    expect(() => publicLeadSchema.parse({ consent: true, formStartedAt: new Date().toISOString(), formType: 'general', phone: '+79991234567', sourcePage: '//evil.test' })).toThrow()
  })

  it('requires a real complex id only for complex-scoped public leads', () => {
    const base = { consent: true as const, formStartedAt: new Date().toISOString(), phone: '+7 999 123-45-67', sourcePage: '/zhk-opera' }
    expect(publicLeadSchema.parse({ ...base, complexId: '123e4567-e89b-42d3-a456-426614174000', formType: 'complex' }).complexId).toBe('123e4567-e89b-42d3-a456-426614174000')
    expect(() => publicLeadSchema.parse({ ...base, formType: 'complex' })).toThrow(/complexId is required/)
    expect(publicLeadSchema.parse({ ...base, formType: 'general', sourcePage: '/novostroyki' }).complexId).toBeUndefined()
    expect(leadSchema.parse({ complexId: '123e4567-e89b-42d3-a456-426614174000', consent: true, phone: '+7 999 123-45-67', sourcePage: '/zhk-opera' }).complexId).toBe('123e4567-e89b-42d3-a456-426614174000')
  })

  it('enforces idempotency, minimum fill time and body limit', async () => {
    expect(idempotencyKeySchema.parse('lead:123456789012')).toBe('lead:123456789012')
    expect(() => idempotencyKeySchema.parse('lead:short')).toThrow()
    expect(() => assertMinimumFillTime(new Date().toISOString())).toThrow(/form_too_fast/)
    expect(() => assertMinimumFillTime(new Date(Date.now() - 3_000).toISOString())).not.toThrow()
    await expect(readBoundedJSON(new Request('https://example.test', { body: JSON.stringify({ value: 'x'.repeat(LEAD_BODY_LIMIT_BYTES) }), headers: { 'content-type': 'application/json' }, method: 'POST' }))).rejects.toThrow(/body_too_large/)
  })

  it('redacts PII from bounded retry errors', () => {
    const redacted = redactDeliveryError('send +7 999 123-45-67 to user@example.test via https://channel.test/path')
    expect(redacted).not.toContain('999')
    expect(redacted).not.toContain('user@example.test')
    expect(redacted).not.toContain('channel.test')
    expect(retryDelay(20)).toBe(30 * 60_000)
  })
})
