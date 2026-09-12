import type { Where } from 'payload'

export const publicPropertyWhere = (): Where => ({ and: [{ isPublished: { equals: true } }, { status: { in: ['active', 'reserved', 'sold'] } }] })
export const publicComplexWhere = (): Where => ({ status: { equals: 'published' } })
export const publicLayoutWhere = (): Where => ({ and: [{ needsReview: { equals: false } }, { status: { equals: 'published' } }] })
export const publicAgentWhere = (): Where => ({ and: [{ isPublished: { equals: true } }, { status: { equals: 'active' } }] })
export const publicPageWhere = (): Where => ({ _status: { equals: 'published' } })
export const publicPostWhere = (): Where => ({ _status: { equals: 'published' } })
export const publicCatalogStatsWhere = (): Where => ({ scope: { equals: 'default' } })

export function withPublicPredicate(predicate: Where, ...conditions: Where[]): Where {
  return { and: [predicate, ...conditions] }
}
