import { describe, expect, it } from 'vitest'

import { createPublicGatewayContext, isPublicGatewayRequest } from '@/core/access/public-gateway'
import { isPublicAddress } from '@/core/security/outbound-http/ip-policy'
import { canReadProperties } from '@/payload/access/properties'
import { buildRuntimeConfig } from '@/project/env'

describe('foundation security contracts', () => {
  it('keeps the public gateway marker private to created server context', () => {
    expect(isPublicGatewayRequest({ context: {} } as never)).toBe(false)
    expect(isPublicGatewayRequest({ context: createPublicGatewayContext() } as never)).toBe(true)
  })

  it('denies raw anonymous business reads and allows only trusted public scope', () => {
    expect(canReadProperties({ req: { context: {}, user: null } } as never)).toBe(false)
    expect(canReadProperties({ req: { context: createPublicGatewayContext(), user: null } } as never)).toEqual({
      isPublished: { equals: true },
    })
  })

  it('rejects private, loopback, link-local and invalid outbound addresses', () => {
    for (const address of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.1.1', '::1', 'fd00::1', 'not-an-ip']) {
      expect(isPublicAddress(address)).toBe(false)
    }
    expect(isPublicAddress('93.184.216.34')).toBe(true)
  })
  it('requires the four core settings in staging', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'staging' })).toThrow(/Missing required runtime/)
  })

  it('accepts the minimal protected runtime contract', () => {
    const config = buildRuntimeConfig({
      APP_ENV: 'staging',
      DATABASE_URL: 'postgres://example.invalid/db',
      NEXT_PUBLIC_SITE_URL: 'https://example.invalid',
      PAYLOAD_SECRET: '9f2c1d4e6a8b0c3d5e7f9a1b2c4d6e8f0a2b4c6d',
      REVALIDATE_SECRET: 'revalidate-secret-value-that-is-long-42',
      S3_ACCESS_KEY_ID: 'access',
      S3_BUCKET: 'bucket',
      S3_REGION: 'ru-1',
      S3_SECRET_ACCESS_KEY: 'secret',
    })
    expect(config.siteURL).toBe('https://example.invalid')
    expect(config.secureCookies).toBe(true)
  })
})
