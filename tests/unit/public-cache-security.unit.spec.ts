import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('public query cache cardinality', () => {
  it('keeps request-derived values out of persistent cache keys', () => {
    const source = readFileSync(resolve('src/core/data-access/public/queries.ts'), 'utf8')
    for (const key of ['catalog', 'complexes', 'property', 'complex', 'agent', 'page', 'post', 'redirect']) expect(source).not.toContain(`cacheFor(['${key}'`)
    expect(source).toContain("cacheFor(['config']")
    expect(source).toContain("cacheFor(['facets']")
    const sitemap = readFileSync(resolve('src/core/data-access/public/sitemap.ts'), 'utf8')
    expect(sitemap).not.toContain("['sitemap', type, String(page)]")
    expect(sitemap).toContain("['sitemap-index']")
  })
})
