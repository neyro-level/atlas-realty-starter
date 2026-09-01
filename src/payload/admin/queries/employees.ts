import type { Where } from 'payload'

import type { Employee } from '@/payload-types'

import { assertAdminCapability, type AdminQueryContext } from '../lib/context'
import { resolvePeriod, type PeriodState } from '../lib/utils'
import { ADMIN_PAGE_SIZE, clampPage, combineWhere, pickString, type PaginationState, type SearchParamsLike } from './shared'

export type EmployeesWorkspace = {
  employees: Employee[]
  filters: {
    search: string
    section: string
    source: string
    status: string
  }
  pagination: PaginationState<Employee>
  period: PeriodState
  stats: {
    activeNow: number
    added: number
    previousTotal: number
    removed: number
  }
}

export async function getEmployeesWorkspace(
  context: AdminQueryContext,
  searchParams: SearchParamsLike,
): Promise<EmployeesWorkspace> {
  assertAdminCapability(context, 'employee.read')
  const period = resolvePeriod(pickString(searchParams.period))
  const page = clampPage(pickString(searchParams.page))
  const filters = {
    search: pickString(searchParams.search),
    section: pickString(searchParams.section),
    source: pickString(searchParams.source),
    status: pickString(searchParams.status),
  }
  const clauses: Where[] = []

  if (filters.source) clauses.push({ origin: { equals: filters.source } })
  if (filters.section) clauses.push({ teamSection: { equals: filters.section } })
  if (filters.status) clauses.push({ status: { equals: filters.status } })
  if (filters.search) {
    clauses.push({
      or: [
        { fullName: { contains: filters.search } },
        { publicName: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
      ],
    })
  }

  const where = clauses.length > 0 ? combineWhere(clauses) : undefined
  const [listResult, activeResult, addedResult, previousResult, removedResult] = await Promise.all([
    context.payload.find({
      collection: 'employees',
      depth: 0,
      limit: ADMIN_PAGE_SIZE,
      overrideAccess: false,
      page,
      sort: 'fullName',
      user: context.user,
      where,
    }),
    context.payload.count({
      collection: 'employees',
      overrideAccess: false,
      user: context.user,
      where: { status: { equals: 'active' } },
    }),
    context.payload.count({
      collection: 'employees',
      overrideAccess: false,
      user: context.user,
      where: { createdAt: { greater_than_equal: period.start.toISOString() } },
    }),
    context.payload.count({
      collection: 'employees',
      overrideAccess: false,
      user: context.user,
      where: { createdAt: { less_than: period.start.toISOString() } },
    }),
    context.payload.count({
      collection: 'employees',
      overrideAccess: false,
      user: context.user,
      where: combineWhere([
        { status: { equals: 'inactive' } },
        { updatedAt: { greater_than_equal: period.start.toISOString() } },
      ]),
    }),
  ])

  return {
    employees: listResult.docs,
    filters,
    pagination: {
      items: listResult.docs,
      page: listResult.page ?? page,
      total: listResult.totalDocs,
      totalPages: listResult.totalPages,
    },
    period,
    stats: {
      activeNow: activeResult.totalDocs,
      added: addedResult.totalDocs,
      previousTotal: previousResult.totalDocs,
      removed: removedResult.totalDocs,
    },
  }
}
