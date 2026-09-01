import type { CollectionConfig } from 'payload'

import { canReadImportErrors, denyImportErrorMutation } from '../access/import-errors'

export const ImportErrors = {
  slug: 'import-errors',
  labels: {
    plural: {
      en: 'Import errors',
      ru: 'Ошибки импорта',
    },
    singular: {
      en: 'Import error',
      ru: 'Ошибка импорта',
    },
  },
  access: {
    create: denyImportErrorMutation,
    delete: denyImportErrorMutation,
    read: canReadImportErrors,
    update: denyImportErrorMutation,
  },
  admin: {
    defaultColumns: ['run', 'externalId', 'code', 'createdAt'],
    hidden: true,
    useAsTitle: 'externalId',
  },
  fields: [
    {
      name: 'run',
      type: 'relationship',
      index: true,
      label: {
        en: 'Run',
        ru: 'Запуск',
      },
      relationTo: 'import-runs',
      required: true,
    },
    {
      name: 'externalId',
      type: 'text',
      index: true,
      label: {
        en: 'External ID',
        ru: 'Внешний ID',
      },
    },
    {
      name: 'code',
      type: 'text',
      index: true,
      label: {
        en: 'Code',
        ru: 'Код',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: {
        en: 'Message',
        ru: 'Сообщение',
      },
      required: true,
    },
  ],
} satisfies CollectionConfig
