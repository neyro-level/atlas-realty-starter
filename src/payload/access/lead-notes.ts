import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadLeadNotes: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.read')

export const canCreateLeadNotes: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.update')

export const denyLeadNoteMutation: NonNullable<CollectionAccess['update']> = () => false
