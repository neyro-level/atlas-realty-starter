import type { CollectionConfig } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { hasAdminCapability, isSuperAdmin } from './capabilities'

const publishedComplexWhere = { status: { equals: 'published' } } as const
type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadResidentialComplexes: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) ? publishedComplexWhere : hasAdminCapability(req.user, 'complex.read')

export const canCreateResidentialComplexes: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'complex.create')

export const canUpdateResidentialComplexes: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'complex.update')

export const canDeleteResidentialComplexes: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  isSuperAdmin(req.user)
