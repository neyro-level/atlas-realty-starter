import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { buildRobots } from '@/app/robots'
import { sitemapPathFor } from '@/core/routing/public-routes'
import { renderSitemapChunk, renderSitemapIndex } from '@/modules/seo/sitemap-xml'
import { APP_ROUTE_TEMPLATES, LEGACY_ROUTE_REDIRECTS } from '@/project/routes'

describe('starter route hygiene', () => {
  it('keeps every registered route backed by an App Router entry', () => {
    for (const route of APP_ROUTE_TEMPLATES) expect(existsSync(route.appEntry), route.id).toBe(true)
  })

  it('generates legacy redirects from the canonical route registry', () => {
    expect(LEGACY_ROUTE_REDIRECTS.agents.from()).toBe('/agents')
    expect(LEGACY_ROUTE_REDIRECTS.agents.to()).toBe('/sotrudniki')
    expect(LEGACY_ROUTE_REDIRECTS.agent.from('ivan')).toBe('/agents/ivan')
    expect(LEGACY_ROUTE_REDIRECTS.agent.to('ivan')).toBe('/sotrudniki/ivan')
    expect(LEGACY_ROUTE_REDIRECTS.articles.from()).toBe('/articles')
    expect(LEGACY_ROUTE_REDIRECTS.articles.to()).toBe('/journal')
  })

  it('maps every sitemap entity to the canonical public route', () => {
    expect(sitemapPathFor('agents', 'ivan')).toBe('/sotrudniki/ivan')
    expect(sitemapPathFor('complexes', 'river')).toBe('/river')
    expect(sitemapPathFor('pages', 'ipoteka')).toBe('/ipoteka')
    expect(sitemapPathFor('posts', 'guide')).toBe('/journal/guide')
    expect(sitemapPathFor('properties', 'flat-1')).toBe('/obekty/flat-1')
  })

  it('renders canonical and escaped XML sitemap URLs', () => {
    expect(renderSitemapIndex('https://example.test/', [{ chunks: 1, type: 'properties' }]))
      .toContain('<loc>https://example.test/sitemaps/properties/0</loc>')
    expect(renderSitemapChunk('https://example.test', [{ lastModified: '2026-09-13', url: '/obekty/a&b' }]))
      .toContain('<loc>https://example.test/obekty/a&amp;b</loc>')
  })

  it('allows indexed production with sitemap and blocks non-indexable environments', () => {
    expect(buildRobots('https://example.test/', true)).toEqual({
      host: 'https://example.test',
      rules: [{ allow: '/', userAgent: '*' }],
      sitemap: 'https://example.test/sitemap.xml',
    })
    expect(buildRobots('https://staging.example.test', false)).toEqual({
      host: 'https://staging.example.test',
      rules: [{ disallow: '/', userAgent: '*' }],
    })
  })
})
