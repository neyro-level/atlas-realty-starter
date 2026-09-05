import type { CollectionConfig } from 'payload'

import { adminWrite, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'
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
    { name: 'origin', type: 'select', defaultValue: 'manual', required: true, index: true, options: ['manual', 'feed'] },
    { name: 'feedSource', type: 'relationship', relationTo: 'feed-sources', index: true },
    { name: 'externalId', type: 'text', index: true },
    { name: 'normalizedPhone', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'position', type: 'text' },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'relationship', relationTo: 'media' },
    { name: 'status', type: 'select', defaultValue: 'active', required: true, index: true, options: ['active', 'inactive'] },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true },
    { name: 'importHash', type: 'text' },
    { name: 'lastSeenAt', type: 'date', index: true },
  ],
  hooks: { ...collectionCacheHooks(['public:agents', 'public:sitemap']), beforeValidate: [formatPageSlug] },
  trash: true,
} satisfies CollectionConfig
