import type { CollectionConfig } from 'payload'

import { hasAdminCapability, isSuperAdmin } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadImportSources: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'import.read')

export const canCreateImportSources: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'import.run')

export const canUpdateImportSources: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'import.run')

export const canDeleteImportSources: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  isSuperAdmin(req.user)
