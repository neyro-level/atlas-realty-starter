import type { CollectionConfig } from 'payload'

import { ownerOnly, publicOrAdmin } from '../access/standard'

export const CatalogStats = {
  slug: 'catalog-stats',
  labels: { plural: 'Статистика каталога', singular: 'Статистика каталога' },
  access: { create: ownerOnly, delete: ownerOnly, read: publicOrAdmin({ scope: { equals: 'default' } }), update: ownerOnly },
  admin: { group: 'Система', useAsTitle: 'scope' },
  fields: [
    { name: 'scope', type: 'text', defaultValue: 'default', required: true, unique: true, index: true },
    { name: 'categories', type: 'json', defaultValue: [] },
    { name: 'districts', type: 'json', defaultValue: [] },
    { name: 'markets', type: 'json', defaultValue: [] },
    { name: 'rooms', type: 'json', defaultValue: [] },
    { name: 'totals', type: 'json', defaultValue: {} },
    { name: 'sourceImportRun', type: 'relationship', relationTo: 'import-runs' },
  ],
} satisfies CollectionConfig
