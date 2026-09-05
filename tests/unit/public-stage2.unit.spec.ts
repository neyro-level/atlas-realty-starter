import { describe, expect, it } from 'vitest'

import { catalogQuerySchema, redirectQuerySchema, slugSchema } from '@/core/query/public-api'

describe('Stage 2 public API input contract', () => {
  it('applies bounded pagination defaults', () => {
    expect(catalogQuerySchema.parse({})).toMatchObject({ limit: 24, page: 1, sort: 'newest' })
    expect(() => catalogQuerySchema.parse({ limit: '51' })).toThrow()
    expect(() => catalogQuerySchema.parse({ page: '0' })).toThrow()
  })

  it('rejects inverted numeric ranges', () => {
    expect(() => catalogQuerySchema.parse({ priceMaxMinor: '100', priceMinMinor: '200' })).toThrow(/priceMinMinor/)
    expect(() => catalogQuerySchema.parse({ areaMaxCm2: '100', areaMinCm2: '200' })).toThrow(/areaMinCm2/)
  })

  it('accepts only normalized slugs and local redirect sources', () => {
    expect(slugSchema.parse('valid-public-slug')).toBe('valid-public-slug')
    expect(() => slugSchema.parse('../private')).toThrow()
    expect(redirectQuerySchema.parse({ from: '/old/path' }).from).toBe('/old/path')
    expect(() => redirectQuerySchema.parse({ from: 'https://evil.test' })).toThrow()
  })
})
