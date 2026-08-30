import type { CollectionConfig } from 'payload'

import { canDeleteContent, canManageContent, publicMediaWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadMedia: NonNullable<CollectionAccess['read']> = ({ req }) =>
  canManageContent(req.user) ? true : publicMediaWhere()

export const canCreateMedia: NonNullable<CollectionAccess['create']> = ({ req }) =>
  canManageContent(req.user)

export const canUpdateMedia: NonNullable<CollectionAccess['update']> = ({ req }) =>
  canManageContent(req.user)

export const canDeleteMedia: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  canDeleteContent(req.user)
