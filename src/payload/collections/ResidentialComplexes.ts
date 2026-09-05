import type { CollectionConfig } from 'payload'

import { adminWrite, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'
import { collectionCacheHooks } from '@/core/cache/public-cache'

export const ResidentialComplexes = {
  slug: 'residential-complexes',
  labels: { plural: 'Жилые комплексы', singular: 'Жилой комплекс' },
  access: { create: adminWrite, delete: ownerOnly, read: publicOrAdmin({ status: { equals: 'published' } }), update: adminWrite },
  admin: { defaultColumns: ['name', 'yandexBuildingId', 'developer', 'readiness', 'status'], group: 'Каталог', useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'developer', type: 'relationship', relationTo: 'developers', index: true },
    { name: 'responsibleAgent', type: 'relationship', relationTo: 'agents', index: true },
    { name: 'yandexBuildingId', type: 'text', unique: true, index: true },
    { name: 'region', type: 'text', index: true },
    { name: 'district', type: 'text', index: true },
    { name: 'address', type: 'text' },
    { name: 'latitude', type: 'number', min: -90, max: 90 },
    { name: 'longitude', type: 'number', min: -180, max: 180 },
    { name: 'description', type: 'textarea' },
    { name: 'photos', type: 'array', fields: [{ name: 'media', type: 'relationship', relationTo: 'media' }, { name: 'externalUrl', type: 'text' }, { name: 'alt', type: 'text' }] },
    { name: 'readiness', type: 'select', index: true, options: ['planned', 'construction', 'commissioned'] },
    { name: 'propertyCount', type: 'number', defaultValue: 0, min: 0, admin: { readOnly: true } },
    { name: 'availablePropertyCount', type: 'number', defaultValue: 0, min: 0, admin: { readOnly: true } },
    { name: 'status', type: 'select', defaultValue: 'draft', required: true, index: true, options: ['draft', 'published', 'hidden'] },
  ],
  hooks: { ...collectionCacheHooks(['public:catalog', 'public:sitemap']), beforeValidate: [formatPageSlug] },
  trash: true,
} satisfies CollectionConfig
