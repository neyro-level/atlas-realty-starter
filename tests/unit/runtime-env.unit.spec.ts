import { describe, expect, it } from 'vitest'

import { buildRuntimeConfig } from '@/project/env'

const strongSecret = 'b2076f81a29d4cfcb8875d98c94589d2bbf1f13ee4d2417f'
const core = {
  DATABASE_URL: 'postgres://db',
  NEXT_PUBLIC_SITE_URL: 'https://example.test',
  PAYLOAD_SECRET: strongSecret,
  REVALIDATE_SECRET: strongSecret,
}
const s3 = {
  S3_ACCESS_KEY_ID: 'access',
  S3_BUCKET: 'bucket',
  S3_REGION: 'ru-1',
  S3_SECRET_ACCESS_KEY: 'secret',
}

describe('runtime environment contract', () => {
  it('rejects placeholders and short protected secrets', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', ...core, PAYLOAD_SECRET: 'change-me-foundation-secret', ...s3 })).toThrow(/placeholder/)
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', ...core, PAYLOAD_SECRET: 'short', ...s3 })).toThrow(/at least 32/)
  })

  it('requires the four core values in staging and S3 only in production', () => {
    for (const key of ['DATABASE_URL', 'NEXT_PUBLIC_SITE_URL', 'PAYLOAD_SECRET', 'REVALIDATE_SECRET'] as const) {
      expect(() => buildRuntimeConfig({ APP_ENV: 'staging', ...core, [key]: undefined })).toThrow(key)
    }
    expect(buildRuntimeConfig({ APP_ENV: 'staging', ...core }).s3).toBeNull()
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', ...core })).toThrow(/S3/)
  })

  it('enforces HTTPS and accepts complete protected runtime configuration', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', ...core, NEXT_PUBLIC_SITE_URL: 'http://example.test', ...s3 })).toThrow(/HTTPS/)
    const result = buildRuntimeConfig({ APP_ENV: 'production', ...core, ...s3 })
    expect(result.siteURL).toBe('https://example.test')
    expect(result.databasePoolMax).toBe(2)
    expect(result.leadRetentionDays).toBe(365)
  })

  it('keeps builds secretless and local storage development-only', () => {
    expect(buildRuntimeConfig({ NEXT_PHASE: 'phase-production-build', NODE_ENV: 'production' }).environment).toBe('development')
    const local = buildRuntimeConfig({ APP_ENV: 'development' })
    expect(local.s3).toBeNull()
    expect(local.databasePoolMax).toBe(10)
  })
})
