import { describe, expect, it } from 'vitest'

import { catalogQuerySchema, redirectQuerySchema, slugSchema } from '@/core/query/public-api'
import { publicAgentWhere, publicComplexWhere, publicPageWhere, publicPostWhere, publicPropertyWhere } from '@/core/data-access/public/predicates'
import { publicPropertyDetailSelect, publicPropertySelect } from '@/core/query/public-selects'
import { isRuntimeReferenceName, validateRuntimeReferenceName } from '@/shared/security/runtime-reference'

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

  it('requires publication predicates independently of collection access', () => {
    expect(publicPropertyWhere()).toMatchObject({ and: expect.arrayContaining([{ isPublished: { equals: true } }]) })
    expect(publicComplexWhere()).toEqual({ status: { equals: 'published' } })
    expect(publicAgentWhere()).toMatchObject({ and: expect.arrayContaining([{ isPublished: { equals: true } }]) })
    expect(publicPageWhere()).toEqual({ _status: { equals: 'published' } })
    expect(publicPostWhere()).toEqual({ _status: { equals: 'published' } })
  })

  it('keeps private and provenance fields outside public selects', () => {
    for (const field of ['apartmentNumber', 'cadastralNumber', 'externalId', 'feedSource', 'importHash', 'internalComment', 'lastImportRun', 'ownerContact']) {
      expect(field in publicPropertySelect).toBe(false)
      expect(field in publicPropertyDetailSelect).toBe(false)
    }
  })

  it('accepts only runtime reference names, never URLs or secret values', () => {
    expect(isRuntimeReferenceName('CLIENT_FEED_URL')).toBe(true)
    expect(validateRuntimeReferenceName('CLIENT_FEED_URL')).toBe(true)
    expect(isRuntimeReferenceName('https://feed.example.test/file.xml')).toBe(false)
    expect(isRuntimeReferenceName('secret-value')).toBe(false)
  })
})
