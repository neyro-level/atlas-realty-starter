import { Writable } from 'node:stream'

import { describe, expect, it } from 'vitest'

import { CONTENT_SECURITY_POLICY_REPORT_ONLY, SECURITY_HEADERS } from '@/core/security/headers'
import { createLogger, normalizeCorrelationID } from '@/core/observability/logger'
import { buildRuntimeConfig } from '@/project/env'

const strongSecret = 'b2076f81a29d4cfcb8875d98c94589d2bbf1f13ee4d2417f'
const productionEnvironment = {
  APP_ENV: 'production',
  DATABASE_URL: 'postgres://db',
  HEALTH_SECRET: strongSecret,
  NEXT_PUBLIC_SITE_URL: 'https://example.test',
  PAYLOAD_DIRECTOR_PASSWORD: 'director-secret',
  PAYLOAD_DIRECTOR_USERNAME: 'director',
  PAYLOAD_SECRET: strongSecret,
  PAYLOAD_SUPERADMIN_PASSWORD: 'superadmin-secret',
  PAYLOAD_SUPERADMIN_USERNAME: 'superadmin',
  PRIVACY_HMAC_SECRET: strongSecret,
  REVALIDATE_SECRET: strongSecret,
  S3_ACCESS_KEY_ID: 'access',
  S3_BUCKET: 'bucket',
  S3_REGION: 'ru-1',
  S3_SECRET_ACCESS_KEY: 'secret',
} as const

describe('Wave 0 security foundation', () => {
  it('redacts PII and secrets from structured logs', () => {
    let output = ''
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString()
        callback()
      },
    })
    const logger = createLogger(destination)

    logger.info({
      email: 'person@example.test',
      nested: { authorization: 'Bearer secret-value', phone: '+70000000000' },
      password: 'password-value',
      safe: 'visible',
    }, 'redaction check')

    expect(output).toContain('visible')
    expect(output).toContain('[REDACTED]')
    expect(output).not.toContain('person@example.test')
    expect(output).not.toContain('+70000000000')
    expect(output).not.toContain('password-value')
    expect(output).not.toContain('secret-value')
  })

  it('requires every core production secret and an HTTPS site URL', () => {
    for (const key of ['HEALTH_SECRET', 'PRIVACY_HMAC_SECRET', 'REVALIDATE_SECRET'] as const) {
      const incomplete = { ...productionEnvironment, [key]: undefined }
      expect(() => buildRuntimeConfig(incomplete)).toThrow(key)
    }
    expect(() => buildRuntimeConfig({ ...productionEnvironment, NEXT_PUBLIC_SITE_URL: 'http://example.test' })).toThrow(/HTTPS/)
    expect(buildRuntimeConfig(productionEnvironment).siteURL).toBe('https://example.test')
  })

  it('publishes the required security header baseline', () => {
    const names = new Set(SECURITY_HEADERS.map((header) => header.key))
    expect(names).toEqual(new Set([
      'Content-Security-Policy-Report-Only',
      'Permissions-Policy',
      'Referrer-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
    ]))
    expect(CONTENT_SECURITY_POLICY_REPORT_ONLY).toContain("frame-ancestors 'none'")
    expect(CONTENT_SECURITY_POLICY_REPORT_ONLY).toContain("object-src 'none'")
  })

  it('accepts only bounded correlation identifiers', () => {
    expect(normalizeCorrelationID('request-123')).toBe('request-123')
    expect(normalizeCorrelationID('unsafe value')).toMatch(/^[0-9a-f-]{36}$/)
    expect(normalizeCorrelationID('x'.repeat(129))).toMatch(/^[0-9a-f-]{36}$/)
  })
})
