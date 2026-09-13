import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { boundedCatalogCacheKey } from '@/core/cache/catalog-cache-key'
import { catalogQuerySchema } from '@/core/query/public-api'

describe('public query cache cardinality', () => {
  it('keeps request-derived values out of persistent cache keys', () => {
    const source = readFileSync(resolve('src/core/data-access/public/queries.ts'), 'utf8')
    for (const key of ['complexes', 'property', 'complex', 'agent', 'page', 'post', 'redirect']) expect(source).not.toContain(`cacheFor(['${key}'`)
    expect(source).toContain("cacheFor(['catalog-bounded'")
    expect(source).toContain("cacheFor(['config']")
    expect(source).toContain("cacheFor(['facets']")
    const sitemap = readFileSync(resolve('src/core/data-access/public/sitemap.ts'), 'utf8')
    expect(sitemap).not.toContain("['sitemap', type, String(page)]")
    expect(sitemap).toContain("['sitemap-index']")
  })

  it('caches only a bounded catalog key space', () => {
    const defaults = catalogQuerySchema.parse({})
    expect(boundedCatalogCacheKey(defaults)).toBeTypeOf('string')
    expect(boundedCatalogCacheKey({ ...defaults, page: 10 })).toBeTypeOf('string')
    expect(boundedCatalogCacheKey({ ...defaults, page: 11 })).toBeNull()
    expect(boundedCatalogCacheKey({ ...defaults, district: 'Центральный' })).toBeNull()
    expect(boundedCatalogCacheKey({ ...defaults, priceMinMinor: 1 })).toBeNull()
    expect(boundedCatalogCacheKey({ ...defaults, q: 'квартира' })).toBeNull()
  })
})
