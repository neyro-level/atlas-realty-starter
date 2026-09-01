import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Where } from 'payload'

import type { AnalyticsEvent } from '@/payload-types'

import { assertAdminCapability, type AdminQueryContext } from '../lib/context'
import { formatPercent, resolvePeriod, toDayKey, type PeriodState } from '../lib/utils'
import { buildAnalyticsCsvRows as buildCsv } from './analytics-csv'
import { combineWhere, pickString, type SearchParamsLike } from './shared'

type AnalyticsSummaryRow = {
  conversions: string | number
  pages: string | number
  sources: string | number
  unique_visitors: string | number
  visits: string | number
}

type AnalyticsDailyRow = {
  conversions: string | number
  date: Date | string
  visits: string | number
}

type AnalyticsDeviceRow = {
  device: string
  events: string | number
}

export type VisitorsWorkspace = {
  daily: Array<{ conversions: number; date: string; visits: number }>
  deviceOptions: string[]
  devices: Record<string, number>
  empty: boolean
  filters: {
    device: string
    page: string
    section: string
    utmSource: string
  }
  pageOptions: string[]
  period: PeriodState
  rows: AnalyticsEvent[]
  sectionOptions: string[]
  summary: {
    conversions: number
    pages: number
    sources: number
    uniqueVisitors: number
    visits: number
  }
  utmOptions: string[]
}

function distinctStrings<T extends 'device' | 'page' | 'section' | 'utmSource'>(
  docs: Array<Record<T, AnalyticsEvent[T]>>,
  field: T,
) {
  return docs
    .map((doc) => doc[field])
    .filter((value): value is NonNullable<AnalyticsEvent[T]> => typeof value === 'string' && value.length > 0)
    .sort((left, right) => left.localeCompare(right, 'ru'))
}

function buildAnalyticsSqlFilters(filters: VisitorsWorkspace['filters'], period: PeriodState) {
  const conditions = ['"occurred_at" >= $1', '"occurred_at" <= $2']
  const params: Array<Date | string> = [period.start, period.end]
  const fieldMap = {
    device: 'device',
    page: 'page',
    section: 'section',
    utmSource: 'utm_source',
  } as const

  Object.entries(fieldMap).forEach(([filterKey, column]) => {
    const value = filters[filterKey as keyof VisitorsWorkspace['filters']]
    if (value) {
      params.push(value)
      conditions.push(`"${column}" = $${params.length}`)
    }
  })

  return {
    params,
    whereSql: conditions.join(' AND '),
  }
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

export async function getVisitorsWorkspace(
  context: AdminQueryContext,
  searchParams: SearchParamsLike,
): Promise<VisitorsWorkspace> {
  assertAdminCapability(context, 'analytics.read')
  const period = resolvePeriod(pickString(searchParams.period))
  const filters = {
    device: pickString(searchParams.device),
    page: pickString(searchParams.page),
    section: pickString(searchParams.section),
    utmSource: pickString(searchParams.utmSource),
  }
  const rangeWhere: Where = {
    and: [
      { occurredAt: { greater_than_equal: period.start.toISOString() } },
      { occurredAt: { less_than_equal: period.end.toISOString() } },
    ],
  }
  const filteredWhere = combineWhere([
    rangeWhere,
    ...(filters.section ? [{ section: { equals: filters.section } }] : []),
    ...(filters.page ? [{ page: { equals: filters.page } }] : []),
    ...(filters.utmSource ? [{ utmSource: { equals: filters.utmSource } }] : []),
    ...(filters.device ? [{ device: { equals: filters.device } }] : []),
  ])
  const adapter = context.payload.db as unknown as PostgresAdapter
  const sqlFilters = buildAnalyticsSqlFilters(filters, period)

  const [summaryResult, dailyResult, devicesResult, recentResult, sectionsResult, pagesResult, utmResult, deviceOptionsResult] =
    await Promise.all([
      adapter.pool.query(
        `SELECT
          COUNT(*)::bigint AS visits,
          COUNT(DISTINCT "visitor_key_hash")::bigint AS unique_visitors,
          COUNT(DISTINCT "page")::bigint AS pages,
          COUNT(DISTINCT "utm_source") FILTER (WHERE "utm_source" IS NOT NULL)::bigint AS sources,
          COUNT(*) FILTER (WHERE "event_type" = 'lead_conversion')::bigint AS conversions
        FROM "analytics_events"
        WHERE ${sqlFilters.whereSql}`,
        sqlFilters.params,
      ),
      adapter.pool.query(
        `SELECT
          DATE_TRUNC('day', "occurred_at") AS date,
          COUNT(*)::bigint AS visits,
          COUNT(*) FILTER (WHERE "event_type" = 'lead_conversion')::bigint AS conversions
        FROM "analytics_events"
        WHERE ${sqlFilters.whereSql}
        GROUP BY 1
        ORDER BY 1 ASC`,
        sqlFilters.params,
      ),
      adapter.pool.query(
        `SELECT "device", COUNT(*)::bigint AS events
        FROM "analytics_events"
        WHERE ${sqlFilters.whereSql}
        GROUP BY "device"
        ORDER BY events DESC`,
        sqlFilters.params,
      ),
      context.payload.find({
        collection: 'analytics-events',
        depth: 0,
        limit: 10,
        overrideAccess: false,
        page: 1,
        sort: '-occurredAt',
        user: context.user,
        where: filteredWhere,
      }),
      context.payload.findDistinct({
        collection: 'analytics-events',
        field: 'section',
        limit: 1000,
        overrideAccess: false,
        user: context.user,
      }),
      context.payload.findDistinct({
        collection: 'analytics-events',
        field: 'page',
        limit: 1000,
        overrideAccess: false,
        user: context.user,
      }),
      context.payload.findDistinct({
        collection: 'analytics-events',
        field: 'utmSource',
        limit: 1000,
        overrideAccess: false,
        user: context.user,
      }),
      context.payload.findDistinct({
        collection: 'analytics-events',
        field: 'device',
        limit: 20,
        overrideAccess: false,
        user: context.user,
      }),
    ])

  const summaryRow = summaryResult.rows[0] as unknown as AnalyticsSummaryRow | undefined
  const dailyRows = dailyResult.rows as unknown as AnalyticsDailyRow[]
  const deviceRows = devicesResult.rows as unknown as AnalyticsDeviceRow[]
  const summary = {
    conversions: toNumber(summaryRow?.conversions),
    pages: toNumber(summaryRow?.pages),
    sources: toNumber(summaryRow?.sources),
    uniqueVisitors: toNumber(summaryRow?.unique_visitors),
    visits: toNumber(summaryRow?.visits),
  }

  return {
    daily: dailyRows.map((row) => ({
      conversions: toNumber(row.conversions),
      date: toDayKey(row.date),
      visits: toNumber(row.visits),
    })),
    deviceOptions: distinctStrings(deviceOptionsResult.values, 'device'),
    devices: Object.fromEntries(deviceRows.map((row) => [row.device, toNumber(row.events)])),
    empty: summary.visits === 0,
    filters,
    pageOptions: distinctStrings(pagesResult.values, 'page'),
    period,
    rows: recentResult.docs,
    sectionOptions: distinctStrings(sectionsResult.values, 'section'),
    summary,
    utmOptions: distinctStrings(utmResult.values, 'utmSource'),
  }
}

export function buildAnalyticsCsvRows(data: VisitorsWorkspace) {
  return buildCsv(data)
}

export function readVisitorsSummary(data: VisitorsWorkspace) {
  const conversion = data.summary.uniqueVisitors > 0 ? (data.summary.conversions / data.summary.uniqueVisitors) * 100 : 0
  return `${data.summary.visits} посещений · ${data.summary.uniqueVisitors} уникальных · ${formatPercent(conversion)}% конверсии`
}
