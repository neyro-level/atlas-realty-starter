import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'
import { publicDocumentWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadOffices: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'office.read') ? true : publicDocumentWhere()

export const canCreateOffices: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'office.update')

export const canUpdateOffices: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'office.update')

export const canDeleteOffices: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  hasAdminCapability(req.user, 'office.update')
