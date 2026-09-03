import type { Where } from 'payload'

import type { AdminQueryContext } from '../lib/context'

export const ADMIN_PAGE_SIZE = 20

export type SearchParamsLike = Record<string, string | string[] | undefined>

export type PaginationState<T> = {
  items: T[]
  page: number
  total: number
  totalPages: number
}

export function pickString(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export function clampPage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export function combineWhere(clauses: Where[]) {
  return clauses.length === 1 ? clauses[0] : { and: clauses }
}

export function relationID(value: null | string | { id: string } | undefined) {
  return typeof value === 'object' && value ? value.id : value
}

export function requireAdminUser(context: AdminQueryContext) {
  return context.user
}
