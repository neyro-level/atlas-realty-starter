import type { CollectionConfig } from 'payload'

import { canAccessAdmin, isFirstUserBootstrap, isSuperAdmin } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canUseAdminPanel: NonNullable<CollectionAccess['admin']> = ({ req }) =>
  canAccessAdmin(req.user)

export const canCreateUsers: NonNullable<CollectionAccess['create']> = async ({ req }) => {
  if (isSuperAdmin(req.user)) {
    return true
  }

  return isFirstUserBootstrap(req)
}

export const canReadUsers: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isSuperAdmin(req.user)

export const canUpdateUsers: NonNullable<CollectionAccess['update']> = ({ req }) =>
  isSuperAdmin(req.user)

export const canDeleteUsers: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  isSuperAdmin(req.user)
