import type { CollectionConfig } from 'payload'

import { canDeleteContent, canManageContent, publicPageWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadPages: NonNullable<CollectionAccess['read']> = ({ req }) =>
  canManageContent(req.user) ? true : publicPageWhere()

export const canCreatePages: NonNullable<CollectionAccess['create']> = ({ req }) =>
  canManageContent(req.user)

export const canUpdatePages: NonNullable<CollectionAccess['update']> = ({ req }) =>
  canManageContent(req.user)

export const canDeletePages: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  canDeleteContent(req.user)
