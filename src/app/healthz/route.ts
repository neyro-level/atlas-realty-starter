import { getPayload } from 'payload'

import config from '@/payload.config'
import { getLeadDeliveryHealth } from '@/core/data-access/system/leads/health'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const leadDeliveries = await getLeadDeliveryHealth(payload)
    return Response.json(
      { leadDeliveries, status: leadDeliveries.alerts.length ? 'degraded' : 'ok' },
      { headers: { 'cache-control': 'no-store' }, status: 200 },
    )
  } catch {
    return Response.json(
      { status: 'unavailable' },
      { headers: { 'cache-control': 'no-store' }, status: 503 },
    )
  }
}
