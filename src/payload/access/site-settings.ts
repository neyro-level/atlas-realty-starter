import type { GlobalConfig } from 'payload'

import { hasAdminCapability } from './capabilities'

type GlobalAccess = NonNullable<GlobalConfig['access']>

export const canReadSiteSettings: NonNullable<GlobalAccess['read']> = () => true

export const canUpdateSiteSettings: NonNullable<GlobalAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'settings.update')
