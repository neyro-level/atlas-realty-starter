import { NextResponse } from 'next/server'

import { buildAnalyticsCsvRows, getVisitorsWorkspace } from '@/payload/admin/lib/workspaces'
import { assertAdminCapability, getAdminRequestContext } from '@/payload/admin/lib/context'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const context = await getAdminRequestContext()
  assertAdminCapability(context, 'analytics.export')
  const data = await getVisitorsWorkspace(context, {
    device: url.searchParams.get('device') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    period: url.searchParams.get('period') ?? undefined,
    section: url.searchParams.get('section') ?? undefined,
    utmSource: url.searchParams.get('utmSource') ?? undefined,
  })
  const csv = buildAnalyticsCsvRows(data)

  return new NextResponse(csv, {
    headers: {
      'Content-Disposition': 'attachment; filename="visitors.csv"',
      'Content-Type': 'text/csv; charset=utf-8',
    },
  })
}
