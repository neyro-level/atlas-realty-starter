import { describe, expect, it } from 'vitest'

import { redactDeliveryError, retryDelay } from '@/core/data-access/system/leads/delivery'
import { deliverToAmsLeads } from '@/project/leads/channels'
import { isAllowedLeadSourcePagePath } from '@/modules/leads/source-page-policy'
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
    const config = { apiURL: 'https://leads.example.test/v1/leads', projectId: 'atlas', siteKey: 'atlas-site-key' }
    let request: Request | undefined
    const okFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      request = new Request(input, init)
      return new Response(null, { status: 202 })
    }
    await expect(deliverToAmsLeads(attempt, config, 'https://atlas.ams24.ru', okFetch)).resolves.toEqual({ ok: true })
    expect(request?.headers.get('idempotency-key')).toBe(attempt.idempotencyKey)
    const body = await request?.json()
    expect(body).toMatchObject({ project: 'atlas', siteLeadId: 'lead-1', phone: '+79991234567', source: 'https://atlas.ams24.ru/nedvizhimost' })
    expect(body).not.toHaveProperty('deliveryId')
    await expect(deliverToAmsLeads(attempt, config, 'https://atlas.ams24.ru', async () => new Response(null, { status: 503 }))).resolves.toMatchObject({ kind: 'retryable' })
    await expect(deliverToAmsLeads(attempt, config, 'https://atlas.ams24.ru', async () => new Response(null, { status: 401 }))).resolves.toMatchObject({ kind: 'permanent' })
  })

  it('normalizes phone, email and requires explicit consent', () => {
    expect(normalizeLeadPhone('8 (999) 123-45-67')).toBe('+79991234567')
    expect(publicLeadSchema.parse({ consent: true, email: 'TEST@EXAMPLE.COM', formStartedAt: new Date().toISOString(), formType: 'general', phone: '+7 999 123-45-67', sourcePage: '/catalog' }).email).toBe('test@example.com')
    expect(() => publicLeadSchema.parse({ consent: false, formStartedAt: new Date().toISOString(), formType: 'general', phone: '+79991234567', sourcePage: '/' })).toThrow()
    expect(() => publicLeadSchema.parse({ company: 'bot', consent: true, formStartedAt: new Date().toISOString(), formType: 'general', phone: '+79991234567', sourcePage: '/' })).toThrow()
    expect(() => publicLeadSchema.parse({ consent: true, formStartedAt: new Date().toISOString(), formType: 'general', phone: '+79991234567', sourcePage: '//evil.test' })).toThrow()
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
