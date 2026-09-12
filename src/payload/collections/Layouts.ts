import type { CollectionConfig } from 'payload'

import { adminWrite, ownerFieldOnly, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'
import { trackSharedEntityManualFields } from '../hooks/trackSharedEntityManualFields'
import { collectionCacheHooks } from '@/core/cache/public-cache'

const sourceManagedAccess = { create: ownerFieldOnly, update: ownerFieldOnly }
const importManagedFields = ['name', 'rooms', 'totalAreaCm2', 'livingAreaCm2', 'kitchenAreaCm2', 'layoutImage'] as const

export const Layouts = {
  slug: 'layouts',
  labels: { plural: 'Планировки', singular: 'Планировка' },
  access: {
    create: adminWrite,
    delete: ownerOnly,
    read: publicOrAdmin({ and: [{ status: { equals: 'published' } }, { needsReview: { equals: false } }] }),
    update: adminWrite,
  },
  admin: {
    defaultColumns: ['name', 'complex', 'building', 'rooms', 'availableUnitCount', 'status', 'needsReview'],
    group: 'Каталог',
    useAsTitle: 'name',
  },
  indexes: [
    { fields: ['feedSource', 'identityKey'], unique: true },
    { fields: ['feedSource', 'complex', 'building', 'status'] },
  ],
  fields: [
    { name: 'feedSource', type: 'relationship', relationTo: 'feed-sources', required: true, index: true, access: sourceManagedAccess },
    { name: 'externalId', type: 'text', index: true, access: sourceManagedAccess },
    { name: 'identityKey', type: 'text', required: true, index: true, access: sourceManagedAccess, admin: { readOnly: true } },
    { name: 'complex', type: 'relationship', relationTo: 'residential-complexes', required: true, index: true, access: sourceManagedAccess },
    { name: 'building', type: 'relationship', relationTo: 'buildings', index: true, access: sourceManagedAccess },
    { name: 'importOwnership', type: 'json', defaultValue: { fields: {}, manualFields: [] }, admin: { readOnly: true }, access: sourceManagedAccess },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'rooms', type: 'number', min: 0, index: true },
    { name: 'totalAreaCm2', type: 'number', required: true, min: 1, index: true },
    { name: 'livingAreaCm2', type: 'number', min: 0 },
    { name: 'kitchenAreaCm2', type: 'number', min: 0 },
    { name: 'layoutImage', type: 'relationship', relationTo: 'media' },
    { name: 'needsReview', type: 'checkbox', defaultValue: false, required: true, index: true },
    { name: 'status', type: 'select', defaultValue: 'draft', required: true, index: true, options: ['draft', 'published', 'hidden'] },
    { name: 'unitCount', type: 'number', defaultValue: 0, min: 0, admin: { readOnly: true }, access: sourceManagedAccess },
    { name: 'availableUnitCount', type: 'number', defaultValue: 0, min: 0, admin: { readOnly: true }, access: sourceManagedAccess },
    { name: 'priceFromMinorUnits', type: 'number', min: 0, admin: { readOnly: true }, access: sourceManagedAccess },
  ],
  hooks: {
    ...collectionCacheHooks(['public:catalog', 'public:sitemap']),
    beforeChange: [trackSharedEntityManualFields(importManagedFields)],
    beforeValidate: [formatPageSlug],
  },
  trash: true,
} satisfies CollectionConfig
