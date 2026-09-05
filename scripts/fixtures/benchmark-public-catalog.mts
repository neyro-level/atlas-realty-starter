import { performance } from 'node:perf_hooks'

import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import { createPublicGatewayContext } from '../../src/core/access/public-gateway.ts'
import config from '../../src/payload.config.ts'

const payload = await getPayload({ config })
const pool = (payload.db as unknown as PostgresAdapter).pool
await pool.query(`UPDATE properties SET is_published=true, published_at=now(), district='Benchmark district', rooms=2 WHERE status='active'`)

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
  where: { and: [{ category: { equals: 'apartment' } }, { status: { in: ['active', 'reserved'] } }] },
})
const catalogMs = Math.round(performance.now() - catalogStarted)

const facetsStarted = performance.now()
let facetRows = 0
for (let page = 1; page <= 10; page++) {
  const result = await payload.find({
    collection: 'properties', context: createPublicGatewayContext(), depth: 0, limit: 5_000, overrideAccess: false,
    page, pagination: true, select: { category: true, district: true, market: true, rooms: true }, where: { status: { in: ['active', 'reserved'] } },
  })
  facetRows += result.docs.length
  if (!result.hasNextPage) break
}
const facetsMs = Math.round(performance.now() - facetsStarted)

if (catalog.totalDocs !== 50_000 || catalog.docs.length !== 24) throw new Error(`Catalog benchmark mismatch: total=${catalog.totalDocs}, page=${catalog.docs.length}`)
if (facetRows !== 50_000) throw new Error(`Facets benchmark mismatch: rows=${facetRows}`)
if (catalog.docs.some((doc) => 'ownerContact' in doc || 'internalComment' in doc || 'apartmentNumber' in doc || 'cadastralNumber' in doc)) throw new Error('Private property field reached benchmark DTO selection')
if (catalogMs > 5_000 || facetsMs > 20_000) throw new Error(`Public query baseline exceeded: catalog=${catalogMs}ms facets=${facetsMs}ms`)

console.log(JSON.stringify({ catalogMs, facetRows, facetsMs, properties: catalog.totalDocs, stage2Performance: 'PASS' }))
process.exit(0)
