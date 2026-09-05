import { describe, expect, it } from 'vitest'

import { redactDeliveryError, retryDelay } from '@/core/data-access/system/leads/delivery'
import { LEAD_BODY_LIMIT_BYTES, assertMinimumFillTime, idempotencyKeySchema, normalizeLeadPhone, publicLeadSchema, readBoundedJSON } from '@/shared/types/public-lead'

describe('Stage 3 public lead contract', () => {
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
