import { timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import { invalidatePublicCache, publicCacheTagValues } from '@/core/cache/public-cache'
import { runtimeConfig } from '@/project/env'

const requestSchema = z.object({ tags: z.array(z.enum(publicCacheTagValues as [string, ...string[]])).min(1).max(10) })

export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length') ?? '0')
  if (!Number.isFinite(length) || length > 8_192) return Response.json({ error: 'request_too_large' }, { status: 413 })
  if (!validSecret(request.headers.get('x-revalidate-secret'))) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const text = await request.text()
  if (text.length > 8_192) return Response.json({ error: 'request_too_large' }, { status: 413 })
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 })
  invalidatePublicCache(parsed.data.tags as Parameters<typeof invalidatePublicCache>[0])
  return Response.json({ revalidated: true })
}

function validSecret(received: string | null) {
  if (!received) return false
  const expected = Buffer.from(runtimeConfig.revalidateSecret)
  const actual = Buffer.from(received)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
