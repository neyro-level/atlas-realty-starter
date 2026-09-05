import { randomUUID } from 'node:crypto'

import type { PostgresAdapter } from '@payloadcms/db-postgres'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

import { importNormalizedUnitBatch } from '../../src/core/data-access/ingest/normalized-unit-import'
import { createNormalizedUnitFixtureBatch } from '../../src/payload/import/unit-fixture'

dotenv.config({ path: '.env' })
dotenv.config({ override: true, path: '.env.local' })
process.env.PAYLOAD_SECRET ||= 'local-fixture-secret-not-for-production'

const { default: config } = await import('../../src/payload.config')

const count = Number(process.env.UNIT_FIXTURE_COUNT ?? 50_000)
const batchSize = 500
if (!Number.isInteger(count) || count < 1) throw new Error('UNIT_FIXTURE_COUNT must be a positive integer')

const payload = await getPayload({ config })
const startedAt = new Date().toISOString()
const startedHeap = process.memoryUsage().heapUsed
let peakHeap = startedHeap

const sourceResult = await payload.find({
  collection: 'import-sources',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  where: { key: { equals: 'performance-fixture' } },
})
const source = sourceResult.docs[0] ?? await payload.create({
  collection: 'import-sources',
  data: {
    adapterConfigured: true,
    isActive: true,
    key: 'performance-fixture',
    title: 'Performance fixture',
  },
  overrideAccess: true,
})

const complexResult = await payload.find({
  collection: 'residential-complexes',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  where: { slug: { equals: 'performance-fixture' } },
})
const residentialComplex = complexResult.docs[0] ?? await payload.create({
  collection: 'residential-complexes',
  data: {
    slug: 'performance-fixture',
    status: 'draft',
    title: 'Performance fixture',
  },
  overrideAccess: true,
})

const buildingIds: number[] = []
for (let index = 0; index < 10; index += 1) {
  const externalId = `fixture-building-${index}`
  const existing = await payload.find({
    collection: 'buildings',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { source: { equals: source.id } },
        { externalId: { equals: externalId } },
      ],
    },
  })
  const building = existing.docs[0] ?? await payload.create({
    collection: 'buildings',
    data: {
      externalId,
      importHash: 'fixture-building-v1',
      isActive: true,
      isPublished: false,
      lastSeenAt: startedAt,
      residentialComplex: residentialComplex.id,
      source: source.id,
      sourceKey: source.key,
      title: `Fixture building ${index + 1}`,
    },
    overrideAccess: true,
  })
  if (typeof building.id !== 'number') throw new Error('PostgreSQL fixture requires numeric building IDs')
  buildingIds.push(building.id)
}
if (typeof source.id !== 'number' || typeof residentialComplex.id !== 'number') {
  throw new Error('PostgreSQL fixture requires numeric source and residential complex IDs')
}

const expectedBatchCount = Math.ceil(count / batchSize)
const run = await payload.create({
  collection: 'import-runs',
  data: {
    correlationId: randomUUID(),
    expectedBatchCount,
    mode: 'full_snapshot',
    processedBatchKeys: [],
    source: source.id,
    startedAt,
    status: 'running',
    target: 'units',
  },
  overrideAccess: true,
})
if (typeof run.id !== 'number') throw new Error('PostgreSQL fixture requires numeric import run IDs')

for (let offset = 0, batchIndex = 0; offset < count; offset += batchSize, batchIndex += 1) {
  const records = createNormalizedUnitFixtureBatch(offset, Math.min(batchSize, count - offset), {
    buildingIds,
    residentialComplexId: residentialComplex.id,
    sourceKey: source.key,
  })
  await importNormalizedUnitBatch(payload, {
    batchKey: `fixture:${run.id}:${batchIndex}`,
    expectedBatchCount,
    importRunId: run.id,
    mode: 'full_snapshot',
    records,
    snapshotStartedAt: startedAt,
    sourceId: source.id,
    sourceKey: source.key,
  })
  peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed)
}

const adapter = payload.db as unknown as PostgresAdapter
const explainResult = await adapter.pool.query(
  `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
   SELECT "id", "number", "floor", "rooms", "total_area", "price", "availability"
   FROM "units"
   WHERE "building_id" = $1 AND "availability" = 'available' AND "is_active" = true
   ORDER BY "floor", "number"
   LIMIT 200`,
  [buildingIds[0]],
)
const plan = explainResult.rows[0]?.['QUERY PLAN']
const serializedPlan = JSON.stringify(plan)
if (!serializedPlan.includes('building_availability_isActive_floor_idx')) {
  throw new Error('Chessboard query plan did not use the expected compound index')
}

const finalRun = await payload.findByID({ collection: 'import-runs', id: run.id, depth: 0, overrideAccess: true })
const heapDeltaMB = Math.round(((peakHeap - startedHeap) / 1024 / 1024) * 10) / 10
if (heapDeltaMB > 256) throw new Error(`Fixture import exceeded the 256 MB heap growth budget: ${heapDeltaMB} MB`)

console.log(JSON.stringify({
  completedBatches: finalRun.completedBatchCount,
  heapDeltaMB,
  imported: finalRun.receivedCount,
  queryExecutionMs: plan?.[0]?.['Execution Time'] ?? null,
  queryPlanUsesCompoundIndex: true,
}))
await payload.destroy()
process.exit(0)
