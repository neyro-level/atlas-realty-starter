import type { CollectionConfig } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { hasAdminCapability } from './capabilities'
import { publicReviewWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>
export const canReadReviews: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) ? publicReviewWhere() : hasAdminCapability(req.user, 'review.moderate')
export const canCreateReviews: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'review.moderate')
export const canUpdateReviews: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'review.moderate')
export const canDeleteReviews: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  hasAdminCapability(req.user, 'review.moderate')
