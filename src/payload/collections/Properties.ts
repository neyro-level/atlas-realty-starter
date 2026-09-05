import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { adminWrite, ownerFieldOnly, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'
import { validateSafeVideoURL } from '@/shared/security/media-url'
import { collectionCacheHooks } from '@/core/cache/public-cache'

const sourceManagedAccess = { create: ownerFieldOnly, update: ownerFieldOnly }
const privateAccess = { create: ownerFieldOnly, read: ownerFieldOnly, update: ownerFieldOnly }

const trackManualFields: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  if (operation !== 'update' || req.context?.ingest === true || !req.user) return data
  const manual = new Set<string>(Array.isArray(originalDoc?.manualFields) ? originalDoc.manualFields : [])
  for (const key of Object.keys(data)) {
    if (!['manualFields', 'updatedAt', 'createdAt'].includes(key)) manual.add(key)
  }
  return { ...data, manualFields: [...manual].sort() }
}

export const Properties = {
  slug: 'properties',
  labels: { plural: 'Объекты', singular: 'Объект' },
  access: {
    create: adminWrite,
    delete: ownerOnly,
    read: publicOrAdmin({ and: [{ isPublished: { equals: true } }, { status: { in: ['active', 'reserved', 'sold'] } }] }),
    update: adminWrite,
  },
  admin: {
    defaultColumns: ['title', 'market', 'category', 'priceMinorUnits', 'status', 'origin'],
    group: 'Каталог',
    listSearchableFields: ['title', 'slug', 'externalId', 'addressPublic'],
    useAsTitle: 'title',
  },
  indexes: [
    { fields: ['feedSource', 'externalId'], unique: true },
    { fields: ['market', 'status', 'isPublished', 'priceMinorUnits'] },
    { fields: ['complex', 'building', 'status'] },
  ],
  fields: [
    { name: 'feedSource', type: 'relationship', relationTo: 'feed-sources', index: true, access: sourceManagedAccess },
    { name: 'externalId', type: 'text', index: true, access: sourceManagedAccess },
    { name: 'origin', type: 'select', defaultValue: 'manual', required: true, index: true, options: ['manual', 'feed'], access: sourceManagedAccess },
    { name: 'importHash', type: 'text', access: sourceManagedAccess },
    { name: 'firstSeenAt', type: 'date', index: true, access: sourceManagedAccess },
    { name: 'lastSeenAt', type: 'date', index: true, access: sourceManagedAccess },
    { name: 'lastImportRun', type: 'relationship', relationTo: 'import-runs', access: sourceManagedAccess },
    { name: 'manualFields', type: 'json', defaultValue: [], admin: { readOnly: true }, access: sourceManagedAccess },
    { name: 'needsReview', type: 'checkbox', defaultValue: false, index: true },
    { name: 'duplicateOf', type: 'relationship', relationTo: 'properties' },
    { name: 'duplicateCandidates', type: 'relationship', relationTo: 'properties', hasMany: true },

    { name: 'status', type: 'select', defaultValue: 'active', required: true, index: true, options: ['active', 'reserved', 'sold', 'removed'] },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true },
    { name: 'publishedAt', type: 'date', index: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false, index: true },

    { name: 'market', type: 'select', required: true, index: true, options: ['secondary', 'newbuild'] },
    { name: 'dealType', type: 'select', defaultValue: 'sale', required: true, index: true, options: ['sale', 'rent'] },
    { name: 'category', type: 'select', required: true, index: true, options: ['apartment', 'house', 'townhouse', 'land', 'commercial', 'parking'] },
    { name: 'dealStatus', type: 'select', index: true, options: ['available', 'reserved', 'sold'] },
    { name: 'isApartments', type: 'checkbox', defaultValue: false, index: true },

    { name: 'priceMinorUnits', type: 'number', required: true, min: 0, index: true },
    { name: 'currency', type: 'select', defaultValue: 'RUB', required: true, options: ['RUB'] },
    { name: 'pricePerMeterMinorUnits', type: 'number', min: 0, index: true },
    { name: 'isPriceNegotiable', type: 'checkbox', defaultValue: false },
    { name: 'mortgageAvailable', type: 'checkbox', defaultValue: false },

    { name: 'totalAreaCm2', type: 'number', required: true, min: 1, index: true },
    { name: 'livingAreaCm2', type: 'number', min: 0 },
    { name: 'kitchenAreaCm2', type: 'number', min: 0 },
    { name: 'rooms', type: 'number', min: 0, index: true },
    { name: 'floor', type: 'number', min: 0, index: true },
    { name: 'floorsTotal', type: 'number', min: 0 },
    { name: 'ceilingHeightCm', type: 'number', min: 0 },
    { name: 'layoutImage', type: 'relationship', relationTo: 'media' },

    { name: 'complex', type: 'relationship', relationTo: 'residential-complexes', index: true },
    { name: 'building', type: 'relationship', relationTo: 'buildings', index: true },
    { name: 'buildingType', type: 'text', index: true },
    { name: 'builtYear', type: 'number', min: 1700, index: true },
    { name: 'readyQuarter', type: 'text' },
    { name: 'buildingState', type: 'text', index: true },
    { name: 'developerName', type: 'text', index: true },

    { name: 'region', type: 'text', index: true },
    { name: 'district', type: 'text', index: true },
    { name: 'localityName', type: 'text', index: true },
    { name: 'subLocalityName', type: 'text' },
    { name: 'street', type: 'text' },
    { name: 'houseNumber', type: 'text' },
    { name: 'addressPublic', type: 'text', index: true },
    { name: 'latitude', type: 'number', min: -90, max: 90 },
    { name: 'longitude', type: 'number', min: -180, max: 180 },
    { name: 'geoPrecision', type: 'select', options: ['exact', 'house', 'street', 'locality', 'unknown'] },

    { name: 'apartmentNumber', type: 'text', access: privateAccess },
    { name: 'cadastralNumber', type: 'text', access: privateAccess },
    { name: 'internalComment', type: 'textarea', access: privateAccess },
    { name: 'ownerContact', type: 'text', access: privateAccess },

    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'photos', type: 'array', fields: [
        { name: 'media', type: 'relationship', relationTo: 'media' },
        { name: 'externalUrl', type: 'text' },
        { name: 'alt', type: 'text' },
        { name: 'isMain', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'videoUrl', type: 'text', validate: validateSafeVideoURL },
    { name: 'agent', type: 'relationship', relationTo: 'agents', index: true },
  ],
  hooks: { ...collectionCacheHooks(['public:catalog', 'public:sitemap']), beforeChange: [trackManualFields], beforeValidate: [formatPageSlug] },
  trash: true,
} satisfies CollectionConfig
