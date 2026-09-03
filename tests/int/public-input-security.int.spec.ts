import { describe, expect, it } from 'vitest'

import { parseCatalogFilters } from '@/modules/catalog/query'
import { isAllowedExternalImageURL, toSafeVideoEmbedURL } from '@/shared/security/media-url'
import type { CatalogPreset } from '@/shared/types/catalog'

const preset: CatalogPreset = {
  description: 'Test',
  fixed: {},
  mode: 'all',
  path: '/catalog',
  title: 'Test',
}

describe('public input security', () => {
  it('bounds and normalizes public catalog filters with Zod', () => {
    const filters = parseCatalogFilters({
      areaFrom: '80',
      areaTo: '20',
      page: '999999999',
      priceFrom: '-1',
      q: 'x'.repeat(1_000),
      rooms: 'studio',
      sort: 'DROP TABLE',
      view: ['list', 'grid'],
    }, preset)

    expect(filters).toMatchObject({ areaFrom: 80, page: 1, sort: 'newest', studio: true, view: 'list' })
    expect(filters.areaTo).toBeUndefined()
    expect(filters.priceFrom).toBeUndefined()
    expect(filters.q).toBeUndefined()
  })

  it('requires exact allowlisted HTTPS image hosts', () => {
    expect(isAllowedExternalImageURL('https://cdn.example.com/image.jpg', ['cdn.example.com'])).toBe(true)
    expect(isAllowedExternalImageURL('https://evilcdn.example.com/image.jpg', ['cdn.example.com'])).toBe(false)
    expect(isAllowedExternalImageURL('http://cdn.example.com/image.jpg', ['cdn.example.com'])).toBe(false)
  })

  it('canonicalizes supported video URLs and rejects suffix tricks', () => {
    expect(toSafeVideoEmbedURL('https://youtu.be/Abc_123-xyz')).toBe('https://www.youtube.com/embed/Abc_123-xyz')
    expect(toSafeVideoEmbedURL('https://evilyoutube.com/watch?v=Abc_123-xyz')).toBeNull()
    expect(toSafeVideoEmbedURL('javascript:alert(1)')).toBeNull()
  })
})
