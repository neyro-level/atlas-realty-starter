import type { CollectionConfig, Where } from 'payload'

import { hasAdminCapability, isSuperAdmin } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

const publicActiveWhere = (): Where => ({
  and: [
    { isActive: { equals: true } },
    { isPublished: { equals: true } },
  ],
})

export const canReadMassCatalog: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'property.read') ? true : publicActiveWhere()

export const canMutateMassCatalog: NonNullable<CollectionAccess['create']> = ({ req }) =>
  isSuperAdmin(req.user)

export const canDeleteMassCatalog: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  isSuperAdmin(req.user)
