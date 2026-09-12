import type { CollectionConfig } from 'payload'

import { adminWrite, ownerFieldOnly, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'
import { trackSharedEntityManualFields } from '../hooks/trackSharedEntityManualFields'
import { collectionCacheHooks } from '@/core/cache/public-cache'

export const Agents = {
  slug: 'agents',
  labels: { plural: 'Агенты', singular: 'Агент' },
  access: {
    create: adminWrite,
    delete: ownerOnly,
    read: publicOrAdmin({ and: [{ isPublished: { equals: true } }, { status: { equals: 'active' } }] }),
    update: adminWrite,
  },
  admin: { defaultColumns: ['name', 'origin', 'status', 'isPublished'], group: 'Каталог', useAsTitle: 'name' },
  indexes: [{ fields: ['feedSource', 'externalId'], unique: true }],
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'origin', type: 'select', defaultValue: 'manual', required: true, index: true, options: ['manual', 'feed'], access: { create: ownerFieldOnly, update: ownerFieldOnly } },
    { name: 'feedSource', type: 'relationship', relationTo: 'feed-sources', index: true, access: { create: ownerFieldOnly, update: ownerFieldOnly } },
    { name: 'externalId', type: 'text', index: true, access: { create: ownerFieldOnly, update: ownerFieldOnly } },
    { name: 'normalizedPhone', type: 'text', index: true, admin: { readOnly: true }, access: { create: ownerFieldOnly, update: ownerFieldOnly } },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'position', type: 'text' },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'relationship', relationTo: 'media' },
    { name: 'status', type: 'select', defaultValue: 'active', required: true, index: true, options: ['active', 'inactive'] },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true },
    { name: 'importOwnership', type: 'json', defaultValue: { fields: {}, manualFields: [] }, admin: { readOnly: true }, access: { create: ownerFieldOnly, update: ownerFieldOnly } },
    { name: 'importHash', type: 'text', admin: { readOnly: true }, access: { create: ownerFieldOnly, update: ownerFieldOnly } },
    { name: 'lastSeenAt', type: 'date', index: true, admin: { readOnly: true }, access: { create: ownerFieldOnly, update: ownerFieldOnly } },
  ],
  hooks: { ...collectionCacheHooks(['public:agents', 'public:sitemap']), beforeChange: [trackSharedEntityManualFields(['name', 'phone', 'email', 'position', 'bio', 'photo', 'isPublished'])], beforeValidate: [formatPageSlug] },
  trash: true,
} satisfies CollectionConfig
