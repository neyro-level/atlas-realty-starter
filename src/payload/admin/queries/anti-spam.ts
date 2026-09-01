import type { PostgresAdapter } from '@payloadcms/db-postgres'

import type { AntiSpamEvent } from '@/payload-types'

import { assertAdminCapability, type AdminQueryContext } from '../lib/context'
import { resolvePeriod, toDayKey, type PeriodState } from '../lib/utils'
import { pickString, type SearchParamsLike } from './shared'

type AntiSpamDailyRow = {
  accepted: number | string
  blocked: number | string
  date: Date | string
}

export type AntiSpamWorkspace = {
  daily: Array<{ accepted: number; blocked: number; date: string }>
  period: PeriodState
  recent: AntiSpamEvent[]
  summary: {
    accepted: number
    blocked: number
    duplicate_suppressed: number
    honeypot: number
    rate_limited: number
    suspicious_burst: number
    too_fast: number
  }
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

export async function getAntiSpamWorkspace(
  context: AdminQueryContext,
  searchParams: SearchParamsLike,
): Promise<AntiSpamWorkspace> {
  assertAdminCapability(context, 'antispam.read')
  const period = resolvePeriod(pickString(searchParams.period))
  const rangeWhere = {
    and: [
      { createdAt: { greater_than_equal: period.start.toISOString() } },
      { createdAt: { less_than_equal: period.end.toISOString() } },
    ],
  }
  const adapter = context.payload.db as unknown as PostgresAdapter
  const [recentResult, acceptedResult, blockedResult, duplicateResult, honeypotResult, rateResult, burstResult, tooFastResult, dailyResult] =
    await Promise.all([
      context.payload.find({
        collection: 'anti-spam-events',
        depth: 1,
        limit: 20,
        overrideAccess: false,
        page: 1,
        sort: '-createdAt',
        user: context.user,
        where: rangeWhere,
      }),
      context.payload.count({
        collection: 'anti-spam-events',
        overrideAccess: false,
        user: context.user,
        where: { and: [...rangeWhere.and, { verdict: { equals: 'accepted' } }] },
      }),
      context.payload.count({
        collection: 'anti-spam-events',
        overrideAccess: false,
        user: context.user,
        where: { and: [...rangeWhere.and, { verdict: { not_equals: 'accepted' } }] },
      }),
      context.payload.count({ collection: 'anti-spam-events', overrideAccess: false, user: context.user, where: { and: [...rangeWhere.and, { verdict: { equals: 'duplicate_suppressed' } }] } }),
      context.payload.count({ collection: 'anti-spam-events', overrideAccess: false, user: context.user, where: { and: [...rangeWhere.and, { verdict: { equals: 'honeypot' } }] } }),
      context.payload.count({ collection: 'anti-spam-events', overrideAccess: false, user: context.user, where: { and: [...rangeWhere.and, { verdict: { equals: 'rate_limited' } }] } }),
      context.payload.count({ collection: 'anti-spam-events', overrideAccess: false, user: context.user, where: { and: [...rangeWhere.and, { verdict: { equals: 'suspicious_burst' } }] } }),
      context.payload.count({ collection: 'anti-spam-events', overrideAccess: false, user: context.user, where: { and: [...rangeWhere.and, { verdict: { equals: 'blocked_too_fast' } }] } }),
      adapter.pool.query(
        `SELECT
          DATE_TRUNC('day', "created_at") AS date,
          COUNT(*) FILTER (WHERE "verdict" = 'accepted')::bigint AS accepted,
          COUNT(*) FILTER (WHERE "verdict" <> 'accepted')::bigint AS blocked
        FROM "anti_spam_events"
        WHERE "created_at" >= $1 AND "created_at" <= $2
        GROUP BY 1
        ORDER BY 1 ASC`,
        [period.start, period.end],
      ),
    ])

  const dailyRows = dailyResult.rows as unknown as AntiSpamDailyRow[]
  return {
    daily: dailyRows.map((row) => ({
      accepted: toNumber(row.accepted),
      blocked: toNumber(row.blocked),
      date: toDayKey(row.date),
    })),
    period,
    recent: recentResult.docs,
    summary: {
      accepted: acceptedResult.totalDocs,
      blocked: blockedResult.totalDocs,
      duplicate_suppressed: duplicateResult.totalDocs,
      honeypot: honeypotResult.totalDocs,
      rate_limited: rateResult.totalDocs,
      suspicious_burst: burstResult.totalDocs,
      too_fast: tooFastResult.totalDocs,
    },
  }
}

export function formatAntiSpamVerdict(verdict: AntiSpamEvent['verdict']) {
  const labels = {
    accepted: 'Принята',
    blocked_too_fast: 'Заблокирована по скорости',
    duplicate_suppressed: 'Дубль подавлен',
    honeypot: 'Заблокирована honeypot',
    rate_limited: 'Ограничена rate limit',
    suspicious_burst: 'Подозрительный всплеск',
  } satisfies Record<AntiSpamEvent['verdict'], string>

  return labels[verdict]
}
