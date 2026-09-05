import type { GlobalConfig } from 'payload'

import { adminWrite, publicGlobalOrAdmin } from '../access/standard'
import { globalCacheHook } from '@/core/cache/public-cache'

export const SiteSettings = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  access: { read: publicGlobalOrAdmin, update: adminWrite },
  admin: { group: 'Контент' },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'AMS Realty Platform' },
    { name: 'defaultTitle', type: 'text' },
    { name: 'defaultDescription', type: 'textarea', maxLength: 160 },
  ],
  hooks: { afterChange: [globalCacheHook(['public:config'])] },
} satisfies GlobalConfig
