import type { Review } from '@/payload-types'

import { assertAdminCapability, type AdminQueryContext } from '../lib/context'
import { ADMIN_PAGE_SIZE, clampPage, pickString, type PaginationState, type SearchParamsLike } from './shared'

export type ReviewsWorkspace = {
  pagination: PaginationState<Review>
  reviews: Review[]
  stats: {
    last30Days: number
    last7Days: number
    pending: number
    published: number
    rejected: number
  }
  status: string
}

export async function getReviewsWorkspace(
  context: AdminQueryContext,
  searchParams: SearchParamsLike,
): Promise<ReviewsWorkspace> {
  assertAdminCapability(context, 'review.moderate')
  const page = clampPage(pickString(searchParams.page))
  const status = pickString(searchParams.status) || 'pending'
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const [listResult, publishedResult, pendingResult, rejectedResult, last30Result, last7Result] = await Promise.all([
    context.payload.find({
      collection: 'reviews',
      depth: 1,
      limit: ADMIN_PAGE_SIZE,
      overrideAccess: false,
      page,
      sort: '-reviewDate',
      user: context.user,
      where: { status: { equals: status } },
    }),
    context.payload.count({
      collection: 'reviews',
      overrideAccess: false,
      user: context.user,
      where: { status: { equals: 'published' } },
    }),
    context.payload.count({
      collection: 'reviews',
      overrideAccess: false,
      user: context.user,
      where: { status: { equals: 'pending' } },
    }),
    context.payload.count({
      collection: 'reviews',
      overrideAccess: false,
      user: context.user,
      where: { status: { equals: 'rejected' } },
    }),
    context.payload.count({
      collection: 'reviews',
      overrideAccess: false,
      user: context.user,
      where: { reviewDate: { greater_than_equal: last30Days.toISOString() } },
    }),
    context.payload.count({
      collection: 'reviews',
      overrideAccess: false,
      user: context.user,
      where: { reviewDate: { greater_than_equal: last7Days.toISOString() } },
    }),
  ])

  return {
    pagination: {
      items: listResult.docs,
      page: listResult.page ?? page,
      total: listResult.totalDocs,
      totalPages: listResult.totalPages,
    },
    reviews: listResult.docs,
    stats: {
      last30Days: last30Result.totalDocs,
      last7Days: last7Result.totalDocs,
      pending: pendingResult.totalDocs,
      published: publishedResult.totalDocs,
      rejected: rejectedResult.totalDocs,
    },
    status,
  }
}
