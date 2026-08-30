import type { GlobalConfig } from 'payload'

import { canReadSiteSettings, canUpdateSiteSettings } from '../access/site-settings'

export const SiteSettings = {
  slug: 'site-settings',
  label: {
    en: 'Site settings',
    ru: 'Настройки сайта',
  },
  access: {
    read: canReadSiteSettings,
    update: canUpdateSiteSettings,
  },
  admin: {
    group: {
      en: 'Management',
      ru: 'Управление',
    },
  },
  fields: [
    {
      name: 'projectName',
      type: 'text',
      label: {
        en: 'Project name',
        ru: 'Название проекта',
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
      name: 'companyName',
      type: 'text',
      label: {
        en: 'Company name',
        ru: 'Название компании',
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
      name: 'socialLinks',
      type: 'array',
      label: {
        en: 'Social links',
        ru: 'Социальные ссылки',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: {
            en: 'Название',
            ru: 'Название',
          },
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: {
            en: 'URL',
            ru: 'Ссылка',
          },
          required: true,
        },
      ],
    },
    {
      name: 'defaultSEO',
      type: 'group',
      label: {
        en: 'Default SEO',
        ru: 'SEO по умолчанию',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: {
            en: 'Description',
            ru: 'Описание',
          },
          maxLength: 160,
        },
      ],
    },
  ],
} satisfies GlobalConfig
