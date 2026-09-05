import type { CollectionConfig } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { canDeleteContent, canManageContent, publicMediaWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadMedia: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) ? publicMediaWhere() : canManageContent(req.user)

export const canCreateMedia: NonNullable<CollectionAccess['create']> = ({ req }) =>
  canManageContent(req.user)

export const canUpdateMedia: NonNullable<CollectionAccess['update']> = ({ req }) =>
  canManageContent(req.user)

export const canDeleteMedia: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  canDeleteContent(req.user)
