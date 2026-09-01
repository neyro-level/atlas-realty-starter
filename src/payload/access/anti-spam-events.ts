import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadAntiSpamEvents: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'antispam.read')

export const denyAntiSpamEventMutation: NonNullable<CollectionAccess['create']> = () => false
