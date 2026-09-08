import { config as loadEnv } from 'dotenv'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { getPayload } from 'payload'

import { systemContext } from '../../src/core/data-access/system/operations'

loadEnv({ path: '.env.local' })
process.env.PAYLOAD_SECRET ||= randomBytes(32).toString('hex')

const [{ default: config }, { runtimeConfig }] = await Promise.all([
  import('../../src/payload.config'),
  import('../../src/project/env'),
])

if (process.env.ATLAS_CLEANUP_ORPHAN_MEDIA !== 'YES') {
  throw new Error('Atlas media cleanup requires ATLAS_CLEANUP_ORPHAN_MEDIA=YES.')
}

const payload = await getPayload({ config })
const client = new pg.Client({ connectionString: runtimeConfig.databaseURL })
await client.connect()

try {
  const media = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 5_000,
    overrideAccess: true,
    pagination: false,
    select: { filename: true },
  })
  const mediaIds = new Set(media.docs.map((item) => String(item.id).toLowerCase()))
  const referencedIds = await findReferencedMediaIds(client, mediaIds)
  const orphaned = media.docs.filter((item) => !referencedIds.has(String(item.id).toLowerCase()))
  const ownedOrphans = orphaned.filter((item) => isAtlasMediaFilename(item.filename))
  const unmanagedOrphans = orphaned.filter((item) => !isAtlasMediaFilename(item.filename))
  const context = systemContext('cleanup-orphaned-atlas-media')

  for (const item of ownedOrphans) {
    await payload.delete({
      collection: 'media',
      context,
      id: item.id,
      overrideAccess: true,
    })
  }

  const remaining = await payload.count({ collection: 'media', overrideAccess: true })
  payload.logger.info(
    {
      deleted: ownedOrphans.length,
      preservedReferenced: referencedIds.size,
      remaining: remaining.totalDocs,
      unmanagedOrphans: unmanagedOrphans.length,
    },
    'Orphaned Atlas media cleanup completed',
  )
} finally {
  await client.end()
}

process.exit(0)

async function findReferencedMediaIds(client: pg.Client, mediaIds: ReadonlySet<string>) {
  const referenced = new Set<string>()
  const foreignKeys = await client.query<{
    columnName: string
    schemaName: string
    tableName: string
  }>(`
    select
      source_attribute.attname as "columnName",
      source_namespace.nspname as "schemaName",
      source_table.relname as "tableName"
    from pg_constraint constraint_info
    join pg_class source_table on source_table.oid = constraint_info.conrelid
    join pg_namespace source_namespace on source_namespace.oid = source_table.relnamespace
    join pg_class target_table on target_table.oid = constraint_info.confrelid
    join pg_namespace target_namespace on target_namespace.oid = target_table.relnamespace
    join lateral unnest(constraint_info.conkey) with ordinality source_key(attnum, ord) on true
    join lateral unnest(constraint_info.confkey) with ordinality target_key(attnum, ord)
      on target_key.ord = source_key.ord
    join pg_attribute source_attribute
      on source_attribute.attrelid = source_table.oid and source_attribute.attnum = source_key.attnum
    join pg_attribute target_attribute
      on target_attribute.attrelid = target_table.oid and target_attribute.attnum = target_key.attnum
    where constraint_info.contype = 'f'
      and target_namespace.nspname = 'public'
      and target_table.relname = 'media'
      and target_attribute.attname = 'id'
  `)

  for (const foreignKey of foreignKeys.rows) {
    const column = quoteIdentifier(foreignKey.columnName)
    const table = `${quoteIdentifier(foreignKey.schemaName)}.${quoteIdentifier(foreignKey.tableName)}`
    const rows = await client.query<{ id: string }>(
      `select distinct ${column}::text as id from ${table} where ${column} is not null`,
    )
    for (const row of rows.rows) referenced.add(row.id.toLowerCase())
  }

  const embeddedColumns = await client.query<{
    columnName: string
    schemaName: string
    tableName: string
  }>(`
    select table_schema as "schemaName", table_name as "tableName", column_name as "columnName"
    from information_schema.columns
    where table_schema = 'public'
      and data_type in ('json', 'jsonb', 'text', 'character varying', 'character')
  `)
  const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu

  for (const embeddedColumn of embeddedColumns.rows) {
    const column = quoteIdentifier(embeddedColumn.columnName)
    const table = `${quoteIdentifier(embeddedColumn.schemaName)}.${quoteIdentifier(embeddedColumn.tableName)}`
    const rows = await client.query<{ value: string }>(
      `select ${column}::text as value from ${table} where ${column} is not null`,
    )
    for (const row of rows.rows) {
      for (const match of row.value.match(uuidPattern) ?? []) {
        const id = match.toLowerCase()
        if (mediaIds.has(id)) referenced.add(id)
      }
    }
  }

  return referenced
}

function isAtlasMediaFilename(filename: null | string | undefined) {
  return /^atlas-[a-f0-9]{20}(?:-\d+)?\.webp$/u.test(filename ?? '')
}

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}
