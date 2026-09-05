import type { GlobalConfig } from 'payload'

import { adminRead, adminWrite } from '../access/standard'

export const SiteSettings = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  access: { read: adminRead, update: adminWrite },
  admin: { group: 'Контент' },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'AMS Realty Platform' },
    { name: 'defaultTitle', type: 'text' },
    { name: 'defaultDescription', type: 'textarea', maxLength: 160 },
  ],
} satisfies GlobalConfig
