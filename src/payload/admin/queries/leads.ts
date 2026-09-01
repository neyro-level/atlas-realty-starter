import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Where } from 'payload'

import type { Employee, Lead } from '@/payload-types'

import { LEAD_DIRECTION_LABELS, LEAD_STATUS_LABELS } from '../lib/constants'
import { assertAdminCapability, type AdminQueryContext } from '../lib/context'
import { resolvePeriod, type PeriodState } from '../lib/utils'
import { ADMIN_PAGE_SIZE, clampPage, combineWhere, pickString, type PaginationState, type SearchParamsLike } from './shared'

type LeadDirectionSummary = {
  label: string
  value: number
}

export type LeadsWorkspace = {
  directions: LeadDirectionSummary[]
  filters: {
    formType: string
    responsible: string
    search: string
    source: string
    sourcePage: string
    status: string
  }
  leads: Lead[]
  options: {
    formTypes: string[]
    responsible: Employee[]
    sourcePages: string[]
    sources: string[]
  }
  pagination: PaginationState<Lead>
  period: PeriodState
  summary: {
    conversion: number
    totalLeads: number
    uniqueVisitors: number
  }
}

function distinctValues<T extends 'formType' | 'source' | 'sourcePage'>(
  values: Array<Record<T, Lead[T]>>,
  field: T,
) {
  return values
    .map((doc) => doc[field])
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .sort((left, right) => left.localeCompare(right, 'ru'))
}

function buildLeadVisitorSql(filters: LeadsWorkspace['filters'], period: PeriodState) {
  const conditions = ['"created_at" >= $1', '"created_at" <= $2']
  const params: Array<Date | number | string> = [period.start, period.end]

  const addCondition = (condition: string, value: number | string) => {
    params.push(value)
    conditions.push(condition.replace('?', `$${params.length}`))
  }

  if (filters.status) addCondition('"status"::text = ?', filters.status)
  if (filters.responsible && Number.isFinite(Number(filters.responsible))) {
    addCondition('"responsible_employee_id" = ?', Number(filters.responsible))
  }
  if (filters.source) addCondition('"source" = ?', filters.source)
  if (filters.sourcePage) addCondition('"source_page" = ?', filters.sourcePage)
  if (filters.formType) addCondition('"form_type" = ?', filters.formType)
  if (filters.search) {
    params.push(`%${filters.search}%`)
    const placeholder = `$${params.length}`
    conditions.push(`("name" ILIKE ${placeholder} OR "phone" ILIKE ${placeholder} OR "email" ILIKE ${placeholder} OR "message" ILIKE ${placeholder})`)
  }

  return {
    params,
    whereSql: conditions.join(' AND '),
  }
}

export async function getLeadsWorkspace(
  context: AdminQueryContext,
  searchParams: SearchParamsLike,
): Promise<LeadsWorkspace> {
  assertAdminCapability(context, 'lead.read')
  const period = resolvePeriod(pickString(searchParams.period))
  const page = clampPage(pickString(searchParams.page))
  const filters = {
    formType: pickString(searchParams.formType),
    responsible: pickString(searchParams.responsible),
    search: pickString(searchParams.search),
    source: pickString(searchParams.source),
    sourcePage: pickString(searchParams.sourcePage),
    status: pickString(searchParams.status),
  }
  const clauses: Where[] = [
    { createdAt: { greater_than_equal: period.start.toISOString() } },
    { createdAt: { less_than_equal: period.end.toISOString() } },
  ]

  if (filters.status) clauses.push({ status: { equals: filters.status } })
  if (filters.responsible) clauses.push({ responsibleEmployee: { equals: filters.responsible } })
  if (filters.source) clauses.push({ source: { equals: filters.source } })
  if (filters.sourcePage) clauses.push({ sourcePage: { equals: filters.sourcePage } })
  if (filters.formType) clauses.push({ formType: { equals: filters.formType } })
  if (filters.search) {
    clauses.push({
      or: [
        { name: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
        { message: { contains: filters.search } },
      ],
    })
  }

  const where = combineWhere(clauses)
  const directionKeys = Object.keys(LEAD_DIRECTION_LABELS) as Array<keyof typeof LEAD_DIRECTION_LABELS>
  const adapter = context.payload.db as unknown as PostgresAdapter
  const visitorSql = buildLeadVisitorSql(filters, period)
  const [listResult, totalResult, visitorResult, employeeResult, formTypesResult, sourcesResult, pagesResult, directionCounts] =
    await Promise.all([
      context.payload.find({
        collection: 'leads',
        depth: 1,
        limit: ADMIN_PAGE_SIZE,
        overrideAccess: false,
        page,
        sort: '-createdAt',
        user: context.user,
        where,
      }),
      context.payload.count({
        collection: 'leads',
        overrideAccess: false,
        user: context.user,
        where,
      }),
      adapter.pool.query(
        `SELECT COUNT(DISTINCT "visitor_key_hash")::bigint AS visitors
        FROM "leads"
        WHERE ${visitorSql.whereSql}`,
        visitorSql.params,
      ),
      context.payload.find({
        collection: 'employees',
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        sort: 'fullName',
        user: context.user,
        where: { status: { equals: 'active' } },
      }),
      context.payload.findDistinct({
        collection: 'leads',
        field: 'formType',
        limit: 1000,
        overrideAccess: false,
        user: context.user,
      }),
      context.payload.findDistinct({
        collection: 'leads',
        field: 'source',
        limit: 1000,
        overrideAccess: false,
        user: context.user,
      }),
      context.payload.findDistinct({
        collection: 'leads',
        field: 'sourcePage',
        limit: 1000,
        overrideAccess: false,
        user: context.user,
      }),
      Promise.all(
        directionKeys.map((direction) =>
          context.payload.count({
            collection: 'leads',
            overrideAccess: false,
            user: context.user,
            where: combineWhere([where, { direction: { equals: direction } }]),
          }),
        ),
      ),
    ])

  const visitorsRow = visitorResult.rows[0] as unknown as { visitors?: number | string } | undefined
  const uniqueVisitors = Number(visitorsRow?.visitors ?? 0)

  return {
    directions: directionKeys.map((direction, index) => ({
      label: LEAD_DIRECTION_LABELS[direction],
      value: directionCounts[index].totalDocs,
    })),
    filters,
    leads: listResult.docs,
    options: {
      formTypes: distinctValues(formTypesResult.values, 'formType'),
      responsible: employeeResult.docs,
      sourcePages: distinctValues(pagesResult.values, 'sourcePage'),
      sources: distinctValues(sourcesResult.values, 'source'),
    },
    pagination: {
      items: listResult.docs,
      page: listResult.page ?? page,
      total: totalResult.totalDocs,
      totalPages: listResult.totalPages,
    },
    period,
    summary: {
      conversion: uniqueVisitors > 0 ? (totalResult.totalDocs / uniqueVisitors) * 100 : 0,
      totalLeads: totalResult.totalDocs,
      uniqueVisitors,
    },
  }
}

export function formatLeadStatus(status: Lead['status']) {
  return LEAD_STATUS_LABELS[status]
}
