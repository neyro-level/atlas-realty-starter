import type { CollectionConfig } from 'payload'

import { hasAdminCapability, manualScopedUpdateAccess } from './capabilities'
import { publicDocumentWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadProperties: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'property.read') ? true : publicDocumentWhere()

export const canCreateProperties: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'property.manual.create')

export const canUpdateProperties = manualScopedUpdateAccess('property.read', 'property.manual.update')

export const canDeleteProperties = manualScopedUpdateAccess('property.read', 'property.manual.publish')
