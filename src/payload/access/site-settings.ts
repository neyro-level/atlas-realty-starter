import type { GlobalConfig } from 'payload'

import { canManageSettings } from './helpers'

type GlobalAccess = NonNullable<GlobalConfig['access']>

export const canReadSiteSettings: NonNullable<GlobalAccess['read']> = () => true

export const canUpdateSiteSettings: NonNullable<GlobalAccess['update']> = ({ req }) =>
  canManageSettings(req.user)
