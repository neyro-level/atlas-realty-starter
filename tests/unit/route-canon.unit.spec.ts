import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildRobots } from '@/app/robots'
import { renderSitemapChunk, renderSitemapIndex } from '@/modules/seo/sitemap-xml'
import { buildCatalogPaginationMetadata, shouldNoIndexCatalogPage } from '@/modules/catalog/pagination'
import { APP_ROUTE_TEMPLATES, routes, sitemapPathFor } from '@/project/routes'

describe('canonical public route registry', () => {
  it('maps every sitemap entity to the real public route', () => {
    expect(sitemapPathFor('properties', 'public-property')).toBe('/obekty/public-property')
    expect(sitemapPathFor('complexes', 'public-complex')).toBe('/public-complex')
    expect(sitemapPathFor('agents', 'public-agent')).toBe('/sotrudniki/public-agent')
    expect(sitemapPathFor('posts', 'public-post')).toBe('/journal/public-post')
    expect(sitemapPathFor('pages', 'public-page')).toBe('/public-page')
  })

  it('keeps the registered templates backed by an application segment', () => {
    for (const template of APP_ROUTE_TEMPLATES) {
      expect(existsSync(resolve(template.appEntry))).toBe(true)
    }
  })

  it('keeps legacy redirect destinations on canonical routes', () => {
    expect(routes.legacyAgents()).toBe('/agents')
    expect(routes.employees()).toBe('/sotrudniki')
    expect(routes.legacyArticles()).toBe('/articles')
    expect(routes.journal()).toBe('/journal')
  })
})

describe('robots indexability contract', () => {
  it('fully blocks non-indexable environments without advertising a sitemap', () => {
    expect(buildRobots({ indexable: false, siteURL: 'https://staging.example.test' })).toEqual({
      host: 'https://staging.example.test',
      rules: [{ disallow: '/', userAgent: '*' }],
    })
  })

  it('allows the public site and advertises the canonical sitemap when indexable', () => {
    expect(buildRobots({ indexable: true, siteURL: 'https://example.test' })).toEqual({
      host: 'https://example.test',
      rules: [{ allow: '/', userAgent: '*' }],
      sitemap: 'https://example.test/sitemap.xml',
    })
  })
})

describe('public XML sitemap contract', () => {
  it('emits canonical chunk locations from the route registry', () => {
    const xml = renderSitemapIndex('https://example.test/', [
      { chunks: 2, type: 'properties' },
      { chunks: 1, type: 'posts' },
    ])
    expect(xml).toContain('<loc>https://example.test/sitemaps/properties/0</loc>')
    expect(xml).toContain('<loc>https://example.test/sitemaps/properties/1</loc>')
    expect(xml).toContain('<loc>https://example.test/sitemaps/posts/0</loc>')
  })

  it('emits only canonical public entity URLs', () => {
    const xml = renderSitemapChunk('https://example.test', [
      { lastModified: '2026-09-13T00:00:00.000Z', url: routes.property('public-property') },
    ])
    expect(xml).toContain('<loc>https://example.test/obekty/public-property</loc>')
    expect(xml).not.toContain('/properties/')
  })

  it('escapes dynamic XML values', () => {
    const xml = renderSitemapChunk('https://example.test', [
      { lastModified: '2026-09-13T00:00:00.000Z', url: '/obekty/a&b' },
    ])
    expect(xml).toContain('/obekty/a&amp;b')
    expect(xml).not.toContain('/obekty/a&b')
  })
})

describe('catalog pagination SEO contract', () => {
  it('keeps self-canonical page links and bounded prev/next relations', () => {
    expect(buildCatalogPaginationMetadata('/kvartiry', 1, 3)).toEqual({ previous: undefined, next: '/kvartiry?page=2' })
    expect(buildCatalogPaginationMetadata('/kvartiry', 2, 3)).toEqual({ previous: '/kvartiry', next: '/kvartiry?page=3' })
    expect(buildCatalogPaginationMetadata('/kvartiry', 3, 3)).toEqual({ previous: '/kvartiry?page=2', next: undefined })
  })

  it('marks only the safety tail after page fifty as non-indexable', () => {
    expect(shouldNoIndexCatalogPage(50)).toBe(false)
    expect(shouldNoIndexCatalogPage(51)).toBe(true)
  })
})
