import type { CollectionConfig } from 'payload'

import {
  canCreateImportSources,
  canDeleteImportSources,
  canReadImportSources,
  canUpdateImportSources,
} from '../access/import-sources'

export const ImportSources = {
  slug: 'import-sources',
  labels: {
    plural: {
      en: 'Import sources',
      ru: 'Источники импорта',
    },
    singular: {
      en: 'Import source',
      ru: 'Источник импорта',
    },
  },
  access: {
    create: canCreateImportSources,
    delete: canDeleteImportSources,
    read: canReadImportSources,
    update: canUpdateImportSources,
  },
  admin: {
    defaultColumns: ['title', 'endpointHint', 'isActive', 'adapterConfigured', 'updatedAt'],
    group: {
      en: 'Cabinet',
      ru: 'Кабинет',
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        ru: 'Название',
      },
      required: true,
    },
    {
      name: 'key',
      type: 'text',
      index: true,
      label: {
        en: 'Stable key',
        ru: 'Стабильный ключ',
      },
      required: true,
      unique: true,
    },
    {
      name: 'endpointHint',
      type: 'text',
      label: {
        en: 'Endpoint hint',
        ru: 'Источник / URL / описание',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Active',
        ru: 'Активен',
      },
    },
    {
      name: 'adapterConfigured',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Adapter configured',
        ru: 'Адаптер подключён',
      },
    },
  ],
} satisfies CollectionConfig
