import type { CollectionConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadImportErrors: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'import.read')

export const denyImportErrorMutation: NonNullable<CollectionAccess['create']> = () => false
