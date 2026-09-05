import type { CollectionConfig } from 'payload'

import { adminWrite, ownerOnly, publicOrAdmin } from '../access/standard'

export const Buildings = {
  slug: 'buildings',
  labels: { plural: 'Корпуса', singular: 'Корпус' },
  access: { create: adminWrite, delete: ownerOnly, read: publicOrAdmin({ isPublished: { equals: true } }), update: adminWrite },
  admin: { defaultColumns: ['name', 'complex', 'yandexHouseId', 'readiness', 'isPublished'], group: 'Каталог', useAsTitle: 'name' },
  indexes: [{ fields: ['complex', 'yandexHouseId'], unique: true }],
  fields: [
    { name: 'complex', type: 'relationship', relationTo: 'residential-complexes', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'yandexHouseId', type: 'text', required: true, index: true },
    { name: 'section', type: 'text' },
    { name: 'phase', type: 'text' },
    { name: 'address', type: 'text' },
    { name: 'latitude', type: 'number', min: -90, max: 90 },
    { name: 'longitude', type: 'number', min: -180, max: 180 },
    { name: 'floors', type: 'number', min: 0 },
    { name: 'readiness', type: 'select', index: true, options: ['planned', 'construction', 'commissioned'] },
    { name: 'handoverAt', type: 'date' },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true },
  ],
  trash: true,
} satisfies CollectionConfig
