import type { GlobalConfig } from 'payload'

import { canReadSiteSettings, canUpdateSiteSettings } from '../access/site-settings'
import { recordContactsActivity } from '@/core/data-access/system/business-hooks'

export const SiteSettings = {
  slug: 'site-settings',
  label: {
    en: 'Contacts',
    ru: 'Контакты',
  },
  access: {
    read: canReadSiteSettings,
    update: canUpdateSiteSettings,
  },
  admin: {
    group: {
      en: 'Cabinet',
      ru: 'Кабинет',
    },
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      label: {
        en: 'Company name',
        ru: 'Название компании',
      },
      required: true,
    },
    {
      name: 'brandName',
      type: 'text',
      label: {
        en: 'Brand name',
        ru: 'Название бренда',
      },
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: {
            en: 'Phone',
            ru: 'Телефон',
          },
        },
        {
          name: 'email',
          type: 'email',
          label: {
            en: 'Email',
            ru: 'Email',
          },
        },
      ],
    },
    {
      name: 'address',
      type: 'textarea',
      label: {
        en: 'Address',
        ru: 'Адрес',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'workingHours',
          type: 'text',
          label: {
            en: 'Working hours',
            ru: 'Режим работы',
          },
        },
        {
          name: 'telegramUrl',
          type: 'text',
          label: {
            en: 'Telegram URL',
            ru: 'Telegram',
          },
        },
      ],
    },
    {
      name: 'vkUrl',
      type: 'text',
      label: {
        en: 'VK URL',
        ru: 'VK',
      },
    },
    {
      name: 'projectName',
      type: 'text',
      admin: { hidden: true },
      label: {
        en: 'Legacy project name',
        ru: 'Legacy: название проекта',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: { hidden: true },
      label: {
        en: 'Legacy social links',
        ru: 'Legacy: социальные ссылки',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'defaultSEO',
      type: 'group',
      admin: { hidden: true },
      label: {
        en: 'Legacy default SEO',
        ru: 'Legacy: SEO по умолчанию',
      },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', maxLength: 160 },
      ],
    },
  ],
  hooks: {
    afterChange: [recordContactsActivity],
  },
} satisfies GlobalConfig
