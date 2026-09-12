import { performance } from 'node:perf_hooks'

import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import { createPublicGatewayContext } from '../../src/core/access/public-gateway.ts'
import config from '../../src/payload.config.ts'

const payload = await getPayload({ config })
const pool = (payload.db as unknown as PostgresAdapter).pool
if (!(await payload.count({ collection: 'residential-complexes', overrideAccess: true, where: { slug: { equals: 'benchmark-complex' } } })).totalDocs) {
  await payload.create({ collection: 'residential-complexes', overrideAccess: true, data: { name: 'Benchmark complex', slug: 'benchmark-complex', status: 'published' } })
}

const catalogStarted = performance.now()
const catalog = await payload.find({
  collection: 'properties',
  context: createPublicGatewayContext(),
  depth: 0,
  limit: 24,
  overrideAccess: false,
  page: 100,
  pagination: true,
  select: { category: true, district: true, id: true, market: true, priceMinorUnits: true, rooms: true, slug: true, title: true, totalAreaCm2: true },
  sort: '-priceMinorUnits',
  where: { and: [{ isPublished: { equals: true } }, { category: { equals: 'apartment' } }, { status: { in: ['active', 'reserved'] } }] },
})
const catalogMs = Math.round(performance.now() - catalogStarted)

const filteredStarted = performance.now()
const filtered = await payload.find({
  collection: 'properties', context: createPublicGatewayContext(), depth: 0, limit: 24, overrideAccess: false, page: 50, pagination: true,
  select: { id: true, priceMinorUnits: true, slug: true, totalAreaCm2: true }, sort: 'totalAreaCm2',
  where: { and: [{ isPublished: { equals: true } }, { status: { in: ['active', 'reserved'] } }, { market: { equals: 'secondary' } }, { district: { equals: 'Benchmark district 0' } }, { rooms: { equals: 2 } }, { priceMinorUnits: { greater_than_equal: 500_000_000 } }, { totalAreaCm2: { less_than_equal: 5_050_000 } }] },
})
const filteredMs = Math.round(performance.now() - filteredStarted)

const facetsStarted = performance.now()
const facets = await payload.find({ collection: 'catalog-stats', context: createPublicGatewayContext(), depth: 0, limit: 1, overrideAccess: false, pagination: false, select: { categories: true, districts: true, markets: true, rooms: true }, where: { scope: { equals: 'default' } } })
const facetsMs = Math.round(performance.now() - facetsStarted)
const detailStarted = performance.now()
const detail = await payload.find({ collection: 'properties', context: createPublicGatewayContext(), depth: 1, limit: 1, overrideAccess: false, select: { id: true, slug: true, title: true, totalAreaCm2: true }, where: { and: [{ isPublished: { equals: true } }, { slug: { equals: catalog.docs[0]!.slug } }] } })
const detailMs = Math.round(performance.now() - detailStarted)
const complexStarted = performance.now()
const complex = await payload.find({ collection: 'residential-complexes', context: createPublicGatewayContext(), depth: 1, limit: 1, overrideAccess: false, select: { id: true, name: true, slug: true }, where: { and: [{ status: { equals: 'published' } }, { slug: { equals: 'benchmark-complex' } }] } })
const complexMs = Math.round(performance.now() - complexStarted)
const sitemapStarted = performance.now()
const sitemap = await payload.find({ collection: 'properties', context: createPublicGatewayContext(), depth: 0, limit: 10_000, overrideAccess: false, page: 1, pagination: true, select: { slug: true, updatedAt: true }, sort: 'id', where: { and: [{ isPublished: { equals: true } }, { status: { in: ['active', 'reserved'] } }] } })
const sitemapMs = Math.round(performance.now() - sitemapStarted)

if (catalog.totalDocs !== 50_000 || catalog.docs.length !== 24) throw new Error(`Catalog benchmark mismatch: total=${catalog.totalDocs}, page=${catalog.docs.length}`)
if (!filtered.totalDocs || filtered.docs.length !== 24) throw new Error(`Filtered catalog benchmark mismatch: total=${filtered.totalDocs}, page=${filtered.docs.length}`)
if (facets.docs.length !== 1 || !Array.isArray(facets.docs[0]?.categories)) throw new Error('Prepared facets benchmark mismatch')
if (detail.docs.length !== 1) throw new Error('Property detail benchmark mismatch')
if (complex.docs.length !== 1) throw new Error('Complex detail benchmark mismatch')
if (sitemap.totalDocs !== 50_000 || sitemap.docs.length !== 10_000) throw new Error(`Sitemap benchmark mismatch: total=${sitemap.totalDocs}, page=${sitemap.docs.length}`)
if (catalog.docs.some((doc) => 'ownerContact' in doc || 'internalComment' in doc || 'apartmentNumber' in doc || 'cadastralNumber' in doc)) throw new Error('Private property field reached benchmark DTO selection')
if (catalogMs > 5_000 || filteredMs > 5_000 || facetsMs > 1_000 || detailMs > 1_000 || complexMs > 1_000 || sitemapMs > 5_000) throw new Error(`Public query baseline exceeded: catalog=${catalogMs}ms filtered=${filteredMs}ms facets=${facetsMs}ms detail=${detailMs}ms complex=${complexMs}ms sitemap=${sitemapMs}ms`)

const planQueries = {
  catalog: `SELECT id FROM properties WHERE is_published=true AND status IN ('active','reserved') AND category='apartment' ORDER BY price_minor_units DESC LIMIT 24 OFFSET 2376`,
  filtered: `SELECT id FROM properties WHERE is_published=true AND status IN ('active','reserved') AND market='secondary' AND district='Benchmark district 0' AND rooms=2 AND price_minor_units>=500000000 AND total_area_cm2<=5050000 ORDER BY total_area_cm2 LIMIT 24 OFFSET 1176`,
  sitemap: `SELECT id, slug, updated_at FROM properties WHERE is_published=true AND status IN ('active','reserved') ORDER BY id LIMIT 10000`,
}
const queryPlans = Object.fromEntries(await Promise.all(Object.entries(planQueries).map(async ([name, query]) => {
  const result = await pool.query(`EXPLAIN (ANALYZE, FORMAT JSON) ${query}`)
  const root = result.rows[0]?.['QUERY PLAN']?.[0]?.Plan as Record<string, unknown> | undefined
  const scans: string[] = []
  const visit = (node: Record<string, unknown> | undefined) => {
    if (!node) return
    if (typeof node['Node Type'] === 'string' && /Scan/.test(node['Node Type'])) scans.push(`${node['Node Type']}:${String(node['Index Name'] ?? node['Relation Name'] ?? '')}`)
    if (Array.isArray(node.Plans)) node.Plans.forEach((child) => visit(child as Record<string, unknown>))
  }
  visit(root)
  return [name, { actualMs: Math.round(Number(root?.['Actual Total Time'] ?? 0)), scans }]
})))

console.log(JSON.stringify({ catalogMs, complexMs, detailMs, facetsMs, filteredMs, preparedFacetRecords: facets.docs.length, properties: catalog.totalDocs, queryPlans, sitemapMs, stage2Performance: 'PASS' }))
process.exit(0)
