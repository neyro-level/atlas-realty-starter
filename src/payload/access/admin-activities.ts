import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadAdminActivities: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'lead.read') ||
  hasAdminCapability(req.user, 'property.read') ||
  hasAdminCapability(req.user, 'review.moderate') ||
  hasAdminCapability(req.user, 'import.read')

export const denyAdminActivityMutation: NonNullable<CollectionAccess['create']> = () => false
