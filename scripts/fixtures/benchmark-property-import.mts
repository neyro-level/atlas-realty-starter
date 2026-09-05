import { performance } from 'node:perf_hooks'

import { getPayload } from 'payload'

import { upsertPropertyBatch } from '../../src/core/data-access/ingest/property-import.ts'
import config from '../../src/payload.config.ts'
import type { NormalizedOffer } from '../../src/shared/types/feed-import.ts'

const payload = await getPayload({ config })
const source = await payload.create({
  collection: 'feed-sources',
  overrideAccess: true,
  data: { code: 'benchmark-50k', title: 'Benchmark 50k', market: 'secondary', parser: 'yrl-secondary', feedUrlRef: 'BENCHMARK_FEED_URL', isEnabled: true, priority: 100, minOffersThresholdPercent: 70, maxOffersLimit: 50_000 },
})
const run = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'benchmark-50k', source: source.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
const seenAt = new Date().toISOString()
const started = performance.now()
let created = 0

for (let offset = 0; offset < 50_000; offset += 500) {
  const offers: NormalizedOffer[] = Array.from({ length: 500 }, (_, index) => {
    const sequence = offset + index
    return {
      externalId: `benchmark-${sequence}`,
      market: 'secondary', category: 'apartment', dealType: 'sale', dealStatus: 'available',
      title: `Benchmark property ${sequence}`, priceMinorUnits: 500_000_000 + sequence, currency: 'RUB', totalAreaCm2: 5_000_000 + sequence,
      address: { format: 'structured', addressPublic: `Ростов-на-Дону, Тестовая, ${sequence}`, localityName: 'Ростов-на-Дону', street: 'Тестовая', houseNumber: String(sequence) },
      photos: [],
    }
  })
  created += (await upsertPropertyBatch(payload, { feedSourceId: source.id, importRunId: run.id, offers, seenAt })).created
}

const elapsedMs = Math.round(performance.now() - started)
const count = await payload.count({ collection: 'properties', overrideAccess: true })
if (created !== 50_000 || count.totalDocs !== 50_000) throw new Error(`50k import mismatch: created=${created}, count=${count.totalDocs}`)
console.log(JSON.stringify({ imported: count.totalDocs, elapsedMs, offersPerSecond: Math.round(50_000 / (elapsedMs / 1000)), stage1Performance: 'PASS' }))
process.exit(0)
