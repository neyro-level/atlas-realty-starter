import type { CollectionConfig, PayloadRequest } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { canDeleteContent, canManageContent, publicMediaWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export function isPublicMediaFileRequest(req: Pick<PayloadRequest, 'url'>) {
  if (!req.url) return false
  try {
    return /^\/api\/media\/file\/[^/]+$/.test(new URL(req.url, 'http://payload.local').pathname)
  } catch {
    return false
  }
}

export const canReadMedia: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) || isPublicMediaFileRequest(req) ? publicMediaWhere() : canManageContent(req.user)

export const canCreateMedia: NonNullable<CollectionAccess['create']> = ({ req }) =>
  canManageContent(req.user)

export const canUpdateMedia: NonNullable<CollectionAccess['update']> = ({ req }) =>
  canManageContent(req.user)

export const canDeleteMedia: NonNullable<CollectionAccess['delete']> = ({ req }) =>
  canDeleteContent(req.user)
