import { Writable } from 'node:stream'

import { describe, expect, it } from 'vitest'

import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from '@/core/security/headers'
import { createLogger, normalizeCorrelationID } from '@/core/observability/logger'
import { isPublicAddress } from '@/core/security/outbound-http/ip-policy'

describe('foundation security', () => {
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

  it('publishes enforced security headers', () => {
    const names = new Set(SECURITY_HEADERS.map((header) => header.key))
    expect(names).toContain('Content-Security-Policy')
    expect(names).not.toContain('Content-Security-Policy-Report-Only')
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'")
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'")
  })

  it('accepts only bounded correlation identifiers', () => {
    expect(normalizeCorrelationID('request-123')).toBe('request-123')
    expect(normalizeCorrelationID('unsafe value')).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('rejects private, metadata, documentation and IPv4-mapped outbound addresses', () => {
    for (const address of ['127.0.0.1', '10.1.2.3', '169.254.169.254', '192.168.1.1', '198.51.100.5', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
      expect(isPublicAddress(address), address).toBe(false)
    }
    expect(isPublicAddress('1.1.1.1')).toBe(true)
    expect(isPublicAddress('2606:4700:4700::1111')).toBe(true)
  })
})
