import { randomUUID } from 'node:crypto'

import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import type { NormalizedFeedRecord } from '@/shared/types/feed-import'

const MAX_BATCH_SIZE = 1_000
const AVAILABILITY = new Set(['available', 'reserved', 'sold', 'hidden'])

type QueryResult<Row extends Record<string, unknown> = Record<string, unknown>> = {
  rowCount: number | null
  rows: Row[]
}

type DatabaseClient = {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<Row>>
  release(): void
}

type UnitValues = {
  availability: 'available' | 'hidden' | 'reserved' | 'sold'
  buildingId: string
  floor: number
  isStudio: boolean
  kitchenArea: number | null
  livingArea: number | null
  number: string
  price: number
  pricePerSquareMeter: number | null
  residentialComplexId: string
  rooms: number
  section: string | null
  totalArea: number
}

export type NormalizedUnitImportInput = {
  batchKey: string
  expectedBatchCount: number
  importRunId: string
  mode: 'delta' | 'full_snapshot'
  records: NormalizedFeedRecord[]
  snapshotStartedAt: string
  sourceId: string
  sourceKey: string
}

export type NormalizedUnitImportOutput = {
  alreadyProcessed: boolean
  completed: boolean
  created: number
  deactivated: number
  received: number
  unchanged: number
  updated: number
}
export type QueueNormalizedUnitImportInput = {
  batchSize?: number
  mode: 'delta' | 'full_snapshot'
  records: NormalizedFeedRecord[]
  sourceId: string
  sourceKey: string
}


type ExistingUnit = {
  external_id: string
  import_hash: string
  is_active: boolean
}

type LockedRun = {
  completed_batch_count: number
  processed_batch_keys: unknown
  status: 'cancelled' | 'failed' | 'partial_success' | 'running' | 'success'
}

function assertFiniteNumber(value: unknown, field: string, minimum = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum) {
    throw new Error(`Invalid normalized unit field: ${field}`)
  }
  return value
}

function optionalFiniteNumber(value: unknown, field: string) {
  if (value == null) return null
  return assertFiniteNumber(value, field)
}

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > 256) {
    throw new Error(`Invalid normalized unit field: ${field}`)
  }
  return value
}

function assertUUID(value: unknown, field: string) {
  const parsed = assertNonEmptyString(value, field)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed)) {
    throw new Error(`Invalid normalized unit field: ${field}`)
  }
  return parsed
}

function readUnitValues(record: NormalizedFeedRecord): UnitValues {
  const value = record.payload
  const availability = value.availability
  if (typeof availability !== 'string' || !AVAILABILITY.has(availability)) {
    throw new Error('Invalid normalized unit field: availability')
  }

  return {
    availability: availability as UnitValues['availability'],
    buildingId: assertUUID(value.buildingId, 'buildingId'),
    floor: assertFiniteNumber(value.floor, 'floor'),
    isStudio: value.isStudio === true,
    kitchenArea: optionalFiniteNumber(value.kitchenArea, 'kitchenArea'),
    livingArea: optionalFiniteNumber(value.livingArea, 'livingArea'),
    number: assertNonEmptyString(value.number, 'number'),
    price: assertFiniteNumber(value.price, 'price'),
    pricePerSquareMeter: optionalFiniteNumber(value.pricePerSquareMeter, 'pricePerSquareMeter'),
    residentialComplexId: assertUUID(value.residentialComplexId, 'residentialComplexId'),
    rooms: assertFiniteNumber(value.rooms, 'rooms'),
    section: value.section == null ? null : assertNonEmptyString(value.section, 'section'),
    totalArea: assertFiniteNumber(value.totalArea, 'totalArea', 0.01),
  }
}

function validateInput(input: NormalizedUnitImportInput) {
  assertNonEmptyString(input.batchKey, 'batchKey')
  assertNonEmptyString(input.sourceKey, 'sourceKey')
  assertUUID(input.sourceId, 'sourceId')
  assertUUID(input.importRunId, 'importRunId')
  assertFiniteNumber(input.expectedBatchCount, 'expectedBatchCount', 1)
  if (input.records.length === 0 || input.records.length > MAX_BATCH_SIZE) {
    throw new Error(`Normalized unit batch must contain 1-${MAX_BATCH_SIZE} records`)
  }
  if (!Number.isFinite(Date.parse(input.snapshotStartedAt))) {
    throw new Error('Invalid normalized unit field: snapshotStartedAt')
  }

  const identities = new Set<string>()
  return input.records.map((record) => {
    const externalId = assertNonEmptyString(record.externalId, 'externalId')
    const contentHash = assertNonEmptyString(record.contentHash, 'contentHash')
    if (record.sourceKey !== input.sourceKey) throw new Error('Normalized unit sourceKey does not match the queued source')
    if (identities.has(externalId)) throw new Error(`Duplicate externalId in normalized unit batch: ${externalId}`)
    identities.add(externalId)
    return { contentHash, externalId, unit: readUnitValues(record) }
  })
}

function buildUpsert(records: ReturnType<typeof validateInput>, input: NormalizedUnitImportInput) {
  const values: unknown[] = []
  const tuples = records.map(({ contentHash, externalId, unit }) => {
    const row = [
      unit.number,
      unit.buildingId,
      unit.residentialComplexId,
      unit.section,
      unit.floor,
      unit.rooms,
      unit.isStudio,
      unit.totalArea,
      unit.livingArea,
      unit.kitchenArea,
      unit.price,
      unit.pricePerSquareMeter,
      unit.availability,
      input.sourceId,
      externalId,
      input.sourceKey,
      contentHash,
      input.snapshotStartedAt,
    ]
    const placeholders = row.map((value) => {
      values.push(value)
      return `$${values.length}`
    })
    return `(${placeholders.join(', ')}, true, now(), now())`
  })

  return {
    text: `INSERT INTO "units" (
      "number", "building_id", "residential_complex_id", "section", "floor", "rooms", "is_studio",
      "total_area", "living_area", "kitchen_area", "price", "price_per_square_meter", "availability",
      "source_id", "external_id", "source_key", "import_hash", "last_seen_at", "is_active", "updated_at", "created_at"
    ) VALUES ${tuples.join(', ')}
    ON CONFLICT ("source_id", "external_id") DO UPDATE SET
      "number" = EXCLUDED."number",
      "building_id" = EXCLUDED."building_id",
      "residential_complex_id" = EXCLUDED."residential_complex_id",
      "section" = EXCLUDED."section",
      "floor" = EXCLUDED."floor",
      "rooms" = EXCLUDED."rooms",
      "is_studio" = EXCLUDED."is_studio",
      "total_area" = EXCLUDED."total_area",
      "living_area" = EXCLUDED."living_area",
      "kitchen_area" = EXCLUDED."kitchen_area",
      "price" = EXCLUDED."price",
      "price_per_square_meter" = EXCLUDED."price_per_square_meter",
      "availability" = EXCLUDED."availability",
      "source_key" = EXCLUDED."source_key",
      "import_hash" = EXCLUDED."import_hash",
      "last_seen_at" = EXCLUDED."last_seen_at",
      "is_active" = true,
      "updated_at" = CASE
        WHEN "units"."import_hash" IS DISTINCT FROM EXCLUDED."import_hash" OR NOT "units"."is_active" THEN now()
        ELSE "units"."updated_at"
      END`,
    values,
  }
}

function readProcessedBatchKeys(value: unknown) {
  return Array.isArray(value) ? value.filter((key): key is string => typeof key === 'string') : []
}

export async function importNormalizedUnitBatch(
  payload: Payload,
  input: NormalizedUnitImportInput,
): Promise<NormalizedUnitImportOutput> {
  const records = validateInput(input)
  const adapter = payload.db as unknown as PostgresAdapter
  const client = (await adapter.pool.connect()) as unknown as DatabaseClient

  try {
    await client.query('BEGIN')
    const source = await client.query<{ key: string }>('SELECT "key" FROM "import_sources" WHERE "id" = $1 AND "is_active" = true', [input.sourceId])
    if (source.rows[0]?.key !== input.sourceKey) throw new Error('Queued import source is missing, inactive, or has a different key')

    const run = await client.query<LockedRun>(
      `SELECT "completed_batch_count", "processed_batch_keys", "status"
       FROM "import_runs"
       WHERE "id" = $1 AND "source_id" = $2
       FOR UPDATE`,
      [input.importRunId, input.sourceId],
    )
    const lockedRun = run.rows[0]
    if (!lockedRun) throw new Error('Import run is missing or belongs to another source')
    const processedBatchKeys = readProcessedBatchKeys(lockedRun.processed_batch_keys)
    if (processedBatchKeys.includes(input.batchKey)) {
      await client.query('COMMIT')
      return { alreadyProcessed: true, completed: lockedRun.status === 'success', created: 0, deactivated: 0, received: 0, unchanged: 0, updated: 0 }
    }
    if (lockedRun.status !== 'running') throw new Error('Import run is no longer running')

    const externalIds = records.map((record) => record.externalId)
    const existing = await client.query<ExistingUnit>(
      `SELECT "external_id", "import_hash", "is_active"
       FROM "units"
       WHERE "source_id" = $1 AND "external_id" = ANY($2::varchar[])`,
      [input.sourceId, externalIds],
    )
    const existingByIdentity = new Map(existing.rows.map((row) => [row.external_id, row]))
    let created = 0
    let updated = 0
    let unchanged = 0
    for (const record of records) {
      const current = existingByIdentity.get(record.externalId)
      if (!current) created += 1
      else if (current.import_hash !== record.contentHash || !current.is_active) updated += 1
      else unchanged += 1
    }

    const upsert = buildUpsert(records, input)
    await client.query(upsert.text, upsert.values)

    const completedBatchCount = Number(lockedRun.completed_batch_count) + 1
    if (completedBatchCount > input.expectedBatchCount) throw new Error('Import run received more batches than expected')
    const completed = completedBatchCount === input.expectedBatchCount
    let deactivated = 0
    if (completed && input.mode === 'full_snapshot') {
      const result = await client.query(
        `UPDATE "units"
         SET "is_active" = false, "updated_at" = now()
         WHERE "source_id" = $1 AND "is_active" = true AND "last_seen_at" < $2::timestamptz`,
        [input.sourceId, input.snapshotStartedAt],
      )
      deactivated = result.rowCount ?? 0
    }

    await client.query(
      `UPDATE "import_runs" SET
        "received_count" = "received_count" + $2,
        "created_count" = "created_count" + $3,
        "updated_count" = "updated_count" + $4,
        "unchanged_count" = "unchanged_count" + $5,
        "completed_batch_count" = $6,
        "deactivated_count" = "deactivated_count" + $7,
        "processed_batch_keys" = $8::jsonb,
        "status" = CASE WHEN $9 THEN 'success'::enum_import_runs_status ELSE "status" END,
        "finished_at" = CASE WHEN $9 THEN now() ELSE "finished_at" END,
        "summary" = CASE WHEN $9 THEN 'Normalized unit import completed' ELSE "summary" END,
        "updated_at" = now()
       WHERE "id" = $1`,
      [
        input.importRunId,
        records.length,
        created,
        updated,
        unchanged,
        completedBatchCount,
        deactivated,
        JSON.stringify([...processedBatchKeys, input.batchKey]),
        completed,
      ],
    )
    await client.query('COMMIT')
    return { alreadyProcessed: false, completed, created, deactivated, received: records.length, unchanged, updated }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function queueNormalizedUnitImport(payload: Payload, input: QueueNormalizedUnitImportInput) {
  const batchSize = input.batchSize ?? 500
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) {
    throw new Error(`Normalized unit import batchSize must be 1-${MAX_BATCH_SIZE}`)
  }
  if (input.records.length === 0) throw new Error('Normalized unit import requires at least one record')

  const correlationId = randomUUID()
  const snapshotStartedAt = new Date().toISOString()
  const expectedBatchCount = Math.ceil(input.records.length / batchSize)
  const run = await payload.create({
    collection: 'import-runs',
    context: { systemWrite: true },
    data: {
      correlationId,
      expectedBatchCount,
      mode: input.mode,
      processedBatchKeys: [],
      source: input.sourceId,
      startedAt: snapshotStartedAt,
      status: 'running',
      target: 'units',
    },
    overrideAccess: true,
  })

  const jobIDs: Array<number | string> = []
  try {
    for (let offset = 0, batchIndex = 0; offset < input.records.length; offset += batchSize, batchIndex += 1) {
      const job = await payload.jobs.queue({
        input: {
          batchKey: `${correlationId}:${batchIndex}`,
          expectedBatchCount,
          importRunId: run.id,
          mode: input.mode,
          records: input.records.slice(offset, offset + batchSize),
          snapshotStartedAt,
          sourceId: input.sourceId,
          sourceKey: input.sourceKey,
        },
        meta: { correlationId, importRunId: run.id },
        overrideAccess: true,
        queue: 'imports',
        task: 'importNormalizedUnits',
      })
      jobIDs.push(job.id)
    }
  } catch (error) {
    await payload.update({
      collection: 'import-runs',
      id: run.id,
      context: { systemWrite: true },
      data: {
        failedCount: 1,
        finishedAt: new Date().toISOString(),
        status: 'failed',
        summary: 'Failed to queue every normalized unit import batch',
      },
      overrideAccess: true,
    })
    throw error
  }

  return { correlationId, jobIDs, runId: run.id }
}
