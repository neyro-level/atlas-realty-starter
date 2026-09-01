import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { runtimeConfig } from '@/project/env'

export async function GET() {
  const payload = await getPayload({ config })
  const adapter = payload.db as unknown as PostgresAdapter

  try {
    await adapter.pool.query('SELECT 1')

    return Response.json({
      database: 'ready',
      release: runtimeConfig.releaseSHA,
      status: 'ok',
    })
  } catch {
    return Response.json(
      {
        database: 'unavailable',
        release: runtimeConfig.releaseSHA,
        status: 'error',
      },
      { status: 503 },
    )
  }
}
