import { describe, expect, it } from 'vitest'

import { buildRuntimeConfig } from '@/project/env'

const strongSecret = 'b2076f81a29d4cfcb8875d98c94589d2bbf1f13ee4d2417f'
const s3 = {
  S3_ACCESS_KEY_ID: 'access',
  S3_BUCKET: 'bucket',
  S3_REGION: 'ru-1',
  S3_SECRET_ACCESS_KEY: 'secret',
}
const retention = { LEAD_RETENTION_DAYS: '365' }
const smtp = {
  EMAIL_FROM_ADDRESS: 'noreply@example.com',
  EMAIL_FROM_NAME: 'Example',
  SMTP_HOST: 'smtp.example.com',
  SMTP_PASSWORD: 'password',
  SMTP_PORT: '465',
  SMTP_SECURE: 'true',
  SMTP_USER: 'user',
}

describe('production environment contract', () => {
  it('rejects known Payload secret placeholders', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: 'change-me-foundation-secret', ...smtp, ...retention, ...s3 })).toThrow(/known placeholder/)
  })

  it('rejects short Payload secrets', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: 'short-secret', ...smtp, ...retention, ...s3 })).toThrow(/at least 32/)
  })

  it('requires persistent S3 storage in production and staging', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...smtp, ...retention })).toThrow(/S3 storage is required/)
    expect(() => buildRuntimeConfig({ APP_ENV: 'staging', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...smtp, ...retention })).toThrow(/S3 storage is required/)
  })
  it('requires an explicit bounded lead retention period outside local environments', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...smtp, ...s3 })).toThrow(/LEAD_RETENTION_DAYS/)
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', LEAD_RETENTION_DAYS: '7', PAYLOAD_SECRET: strongSecret, ...smtp, ...s3 })).toThrow(/between 30 and 3650/)
  })
  it('requires complete production SMTP configuration', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...retention, ...s3 })).toThrow(/SMTP/)
  })
  it('treats NODE_ENV production as production when APP_ENV is absent', () => {
    expect(() => buildRuntimeConfig({ NODE_ENV: 'production' })).toThrow(/production/)
  })
  it('keeps reproducible production builds secretless but enforces runtime startup', () => {
    expect(buildRuntimeConfig({ NEXT_PHASE: 'phase-production-build', NODE_ENV: 'production' }).environment).toBe('development')
  })





  it('allows local upload storage only in development and test', () => {
    expect(buildRuntimeConfig({ APP_ENV: 'development', PAYLOAD_SECRET: 'change-me-foundation-secret' }).s3).toBeNull()
    expect(buildRuntimeConfig({ APP_ENV: 'test', PAYLOAD_SECRET: 'test-secret' }).s3).toBeNull()
  })

  it('accepts a strong production secret with complete S3 config', () => {
    const result = buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...smtp, ...retention, ...s3 })
    expect(result.s3).toMatchObject({ bucket: 'bucket', region: 'ru-1' })
  })
})
