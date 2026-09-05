import type { GlobalConfig } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { hasAdminCapability } from './capabilities'

type GlobalAccess = NonNullable<GlobalConfig['access']>
export const canReadSiteSettings: NonNullable<GlobalAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) || hasAdminCapability(req.user, 'settings.read')
export const canUpdateSiteSettings: NonNullable<GlobalAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'settings.update')
