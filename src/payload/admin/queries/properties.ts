import type { Where } from 'payload'

import type { Employee, Property } from '@/payload-types'

import { PROPERTY_CATEGORY_LABELS } from '../lib/constants'
import { assertAdminCapability, type AdminQueryContext } from '../lib/context'
import { ADMIN_PAGE_SIZE, clampPage, combineWhere, pickString, type PaginationState, type SearchParamsLike } from './shared'

export type PropertiesWorkspace = {
  categories: Array<{ label: string; value: number }>
  filters: {
    category: string
    origin: string
    priceMax: number
    priceMin: number
    responsible: string
    search: string
    status: string
    updatedFrom: string
  }
  options: {
    responsible: Employee[]
  }
  pagination: PaginationState<Property>
  properties: Property[]
  summary: {
    attention: number
    manual: number
    published: number
    total: number
  }
}

export async function getPropertiesWorkspace(
  context: AdminQueryContext,
  searchParams: SearchParamsLike,
): Promise<PropertiesWorkspace> {
  assertAdminCapability(context, 'property.read')
  const page = clampPage(pickString(searchParams.page))
  const filters = {
    category: pickString(searchParams.category),
    origin: pickString(searchParams.origin),
    priceMax: Number(pickString(searchParams.priceMax) || 0),
    priceMin: Number(pickString(searchParams.priceMin) || 0),
    responsible: pickString(searchParams.responsible),
    search: pickString(searchParams.search),
    status: pickString(searchParams.status),
    updatedFrom: pickString(searchParams.updatedFrom),
  }
  const clauses: Where[] = []

  if (filters.category) clauses.push({ category: { equals: filters.category } })
  if (filters.origin) clauses.push({ origin: { equals: filters.origin } })
  if (filters.status) clauses.push({ workflowStatus: { equals: filters.status } })
  if (filters.responsible) clauses.push({ responsibleEmployee: { equals: filters.responsible } })
  if (filters.priceMin > 0) clauses.push({ price: { greater_than_equal: filters.priceMin } })
  if (filters.priceMax > 0) clauses.push({ price: { less_than_equal: filters.priceMax } })
  if (filters.updatedFrom) clauses.push({ updatedFromSourceAt: { greater_than_equal: filters.updatedFrom } })
  if (filters.search) {
    clauses.push({
      or: [
        { title: { contains: filters.search } },
        { objectCode: { contains: filters.search } },
        { addressLine: { contains: filters.search } },
        { publicSlug: { contains: filters.search } },
      ],
    })
  }

  const where = clauses.length > 0 ? combineWhere(clauses) : undefined
  const attentionWhere: Where = {
    or: [
      { workflowStatus: { equals: 'draft' } },
      { price: { exists: false } },
      { addressLine: { exists: false } },
      { responsibleEmployee: { exists: false } },
    ],
  }
  const categoryKeys = Object.keys(PROPERTY_CATEGORY_LABELS) as Array<keyof typeof PROPERTY_CATEGORY_LABELS>
  const [listResult, totalResult, publishedResult, manualResult, attentionResult, employeeResult, categoryCounts] =
    await Promise.all([
      context.payload.find({
        collection: 'properties',
        depth: 1,
        limit: ADMIN_PAGE_SIZE,
        overrideAccess: false,
        page,
        sort: '-updatedAt',
        user: context.user,
        where,
      }),
      context.payload.count({ collection: 'properties', overrideAccess: false, user: context.user }),
      context.payload.count({
        collection: 'properties',
        overrideAccess: false,
        user: context.user,
        where: { isPublished: { equals: true } },
      }),
      context.payload.count({
        collection: 'properties',
        overrideAccess: false,
        user: context.user,
        where: { origin: { equals: 'MANUAL' } },
      }),
      context.payload.count({
        collection: 'properties',
        overrideAccess: false,
        user: context.user,
        where: attentionWhere,
      }),
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
      Promise.all(
        categoryKeys.map((category) =>
          context.payload.count({
            collection: 'properties',
            overrideAccess: false,
            user: context.user,
            where: { category: { equals: category } },
          }),
        ),
      ),
    ])

  return {
    categories: categoryKeys.map((category, index) => ({
      label: PROPERTY_CATEGORY_LABELS[category],
      value: categoryCounts[index].totalDocs,
    })),
    filters,
    options: {
      responsible: employeeResult.docs,
    },
    pagination: {
      items: listResult.docs,
      page: listResult.page ?? page,
      total: listResult.totalDocs,
      totalPages: listResult.totalPages,
    },
    properties: listResult.docs,
    summary: {
      attention: attentionResult.totalDocs,
      manual: manualResult.totalDocs,
      published: publishedResult.totalDocs,
      total: totalResult.totalDocs,
    },
  }
}
