import type { CollectionConfig, Where } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { hasAdminCapability, isSuperAdmin } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>
const publicActiveWhere = (): Where => ({
  and: [{ isActive: { equals: true } }, { isPublished: { equals: true } }],
})

export const canReadMassCatalog: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) ? publicActiveWhere() : hasAdminCapability(req.user, 'property.read')

export const canMutateMassCatalog: NonNullable<CollectionAccess['create']> = ({ req }) =>
  isSuperAdmin(req.user)

export const canDeleteMassCatalog: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  isSuperAdmin(req.user)
