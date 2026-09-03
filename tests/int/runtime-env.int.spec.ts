import { describe, expect, it } from 'vitest'

import { buildRuntimeConfig } from '@/project/env'

const strongSecret = 'b2076f81a29d4cfcb8875d98c94589d2bbf1f13ee4d2417f'
const s3 = {
  S3_ACCESS_KEY_ID: 'access',
  S3_BUCKET: 'bucket',
  S3_REGION: 'ru-1',
  S3_SECRET_ACCESS_KEY: 'secret',
}
const bootstrap = {
  PAYLOAD_DIRECTOR_PASSWORD: 'director-secret',
  PAYLOAD_DIRECTOR_USERNAME: 'director',
  PAYLOAD_SUPERADMIN_PASSWORD: 'superadmin-secret',
  PAYLOAD_SUPERADMIN_USERNAME: 'superadmin',
}

describe('production environment contract', () => {
  it('rejects known Payload secret placeholders', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: 'change-me-foundation-secret', ...bootstrap, ...s3 })).toThrow(/known placeholder/)
  })

  it('rejects short Payload secrets', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: 'short-secret', ...bootstrap, ...s3 })).toThrow(/at least 32/)
  })

  it('requires persistent S3 storage in production and staging', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...bootstrap })).toThrow(/S3 storage is required/)
    expect(() => buildRuntimeConfig({ APP_ENV: 'staging', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...bootstrap })).toThrow(/S3 storage is required/)
  })
  it('defaults lead retention to 365 days without SMTP', () => {
    const result = buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...bootstrap, ...s3 })
    expect(result.leadRetentionDays).toBe(365)
    expect('email' in result).toBe(false)
    expect(result.databasePoolMax).toBe(2)
  })

  it('requires separate production bootstrap credentials', () => {
    expect(() => buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...s3 })).toThrow(/bootstrap/)
  })
  it('treats NODE_ENV production as production when APP_ENV is absent', () => {
    expect(() => buildRuntimeConfig({ NODE_ENV: 'production' })).toThrow(/bootstrap/)
  })
  it('keeps reproducible production builds secretless but enforces runtime startup', () => {
    expect(buildRuntimeConfig({ NEXT_PHASE: 'phase-production-build', NODE_ENV: 'production' }).environment).toBe('development')
  })





  it('allows local upload storage only in development and test', () => {
    const local = buildRuntimeConfig({ APP_ENV: 'development', PAYLOAD_SECRET: 'change-me-foundation-secret' })
    expect(local.s3).toBeNull()
    expect(local.leadRetentionDays).toBe(365)
    expect(local.databasePoolMax).toBe(10)
    expect(() => buildRuntimeConfig({ APP_ENV: 'development', DATABASE_POOL_MAX: '0' })).toThrow(/DATABASE_POOL_MAX/)
    expect(local.bootstrapUsers?.map((user) => [user.username, user.password])).toEqual([
      ['superadmin', '12341234'],
      ['director', '12341234'],
    ])
    expect(buildRuntimeConfig({ APP_ENV: 'test', PAYLOAD_SECRET: 'test-secret' }).bootstrapUsers).toBeNull()
  })

  it('accepts a strong production secret with complete S3 config', () => {
    const result = buildRuntimeConfig({ APP_ENV: 'production', DATABASE_URL: 'postgres://db', PAYLOAD_SECRET: strongSecret, ...bootstrap, ...s3 })
    expect(result.s3).toMatchObject({ bucket: 'bucket', region: 'ru-1' })
  })
})
