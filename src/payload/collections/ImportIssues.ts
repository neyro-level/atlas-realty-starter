import type { CollectionConfig } from 'payload'

import { adminRead, systemManaged } from '../access/standard'

export const ImportIssues = {
  slug: 'import-issues',
  labels: { plural: 'Проблемы импорта', singular: 'Проблема импорта' },
  access: { create: systemManaged, delete: systemManaged, read: adminRead, update: systemManaged },
  admin: { defaultColumns: ['run', 'severity', 'code', 'externalId', 'createdAt'], group: 'Импорт', useAsTitle: 'code' },
  fields: [
    { name: 'run', type: 'relationship', relationTo: 'import-runs', required: true, index: true },
    { name: 'severity', type: 'select', required: true, index: true, options: ['warning', 'error', 'critical'] },
    { name: 'externalId', type: 'text', index: true },
    { name: 'code', type: 'text', required: true, index: true },
    { name: 'message', type: 'textarea', required: true, maxLength: 1000 },
    { name: 'recordIndex', type: 'number', min: 0 },
  ],
} satisfies CollectionConfig
