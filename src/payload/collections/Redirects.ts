import type { CollectionConfig } from 'payload'

import { adminRead, adminWrite, ownerOnly } from '../access/standard'

export const Redirects = {
  slug: 'redirects',
  labels: { plural: 'Перенаправления', singular: 'Перенаправление' },
  access: { create: adminWrite, delete: ownerOnly, read: adminRead, update: adminWrite },
  admin: { defaultColumns: ['from', 'to', 'statusCode', 'isEnabled'], group: 'Контент', useAsTitle: 'from' },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, index: true },
    { name: 'to', type: 'text', required: true },
    { name: 'statusCode', type: 'select', defaultValue: '301', required: true, options: ['301', '302', '307', '308'] },
    { name: 'isEnabled', type: 'checkbox', defaultValue: true, index: true },
  ],
} satisfies CollectionConfig
