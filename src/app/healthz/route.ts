import { getPayload } from 'payload'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await getPayload({ config })
    return Response.json(
      { status: 'ok' },
      { headers: { 'cache-control': 'no-store' }, status: 200 },
    )
  } catch {
    return Response.json(
      { status: 'unavailable' },
      { headers: { 'cache-control': 'no-store' }, status: 503 },
    )
  }
}
