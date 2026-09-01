import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadImportRuns: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'import.read')

export const denyImportRunMutation: NonNullable<CollectionAccess['create']> = () => false
