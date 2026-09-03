import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import { createRequestLogger, normalizeCorrelationID } from '@/core/observability/logger'
import config from '@/payload.config'
import { runtimeConfig } from '@/project/env'

export async function GET(request: Request) {
  const correlationID = normalizeCorrelationID(request.headers.get('x-correlation-id'))
  const requestLogger = createRequestLogger(correlationID)
  const payload = await getPayload({ config })
  const adapter = payload.db as unknown as PostgresAdapter

  try {
    await adapter.pool.query('SELECT 1')

    return Response.json(
      {
        database: 'ready',
        release: runtimeConfig.releaseSHA,
        status: 'ok',
      },
      { headers: { 'x-correlation-id': correlationID } },
    )
  } catch (error) {
    requestLogger.error({ errorCode: readErrorCode(error) }, 'Database health check failed')
    return Response.json(
      {
        database: 'unavailable',
        release: runtimeConfig.releaseSHA,
        status: 'error',
      },
      { headers: { 'x-correlation-id': correlationID }, status: 503 },
    )
  }
}

function readErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return 'UNKNOWN'
  return typeof error.code === 'string' && /^[A-Z0-9_-]{1,64}$/.test(error.code) ? error.code : 'UNKNOWN'
}
