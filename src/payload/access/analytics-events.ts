import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadAnalyticsEvents: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'analytics.read')

export const denyAnalyticsEventMutation: NonNullable<CollectionAccess['create']> = () => false
