import { describe, expect, it } from 'vitest'

import { parseCatalogSearchParams, resolveCatalogLimit } from '@/modules/catalog'
import { buildCatalogPageHref, resolveCatalogPageParam } from '@/modules/catalog/pagination'

describe('catalog pagination contract', () => {
  it('accepts only the shared SSR and API limit whitelist', () => {
    for (const limit of [1, 16, 20, 24, 50]) expect(resolveCatalogLimit(limit)).toBe(limit)
    for (const limit of [2, 19, 25, 51, 100]) expect(resolveCatalogLimit(limit)).toBeUndefined()
    expect(parseCatalogSearchParams(new URLSearchParams('limit=50')).limit).toBe(50)
    expect(parseCatalogSearchParams(new URLSearchParams('limit=49')).limit).toBeUndefined()
  })

  it('preserves explicit page size so load-more and numbered links address the same slice', () => {
    expect(buildCatalogPageHref('/kvartiry', { dealType: 'sale', limit: 20 }, 1)).toBe('/kvartiry?deal_type=sale&limit=20')
    expect(buildCatalogPageHref('/kvartiry', { dealType: 'sale', limit: 20 }, 3)).toBe('/kvartiry?deal_type=sale&limit=20&page=3')
    expect(resolveCatalogPageParam('3')).toEqual({ page: 3, valid: true })
  })

  it('keeps the next numbered link based on the URL page', () => {
    const urlPage = 2
    const loadedThroughPage = 4
    expect(buildCatalogPageHref('/kvartiry', {}, urlPage + 1)).toBe('/kvartiry?page=3')
    expect(loadedThroughPage + 1).toBe(5)
  })
})
