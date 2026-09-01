import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadLeads: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.read')

export const canCreateLeads: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.update')

export const canUpdateLeads: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.update')

export const canDeleteLeads: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.update')
