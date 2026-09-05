import type { CollectionConfig } from 'payload'

import { adminWrite, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'

export const Developers = {
  slug: 'developers',
  labels: { plural: 'Застройщики', singular: 'Застройщик' },
  access: { create: adminWrite, delete: ownerOnly, read: publicOrAdmin({ isPublished: { equals: true } }), update: adminWrite },
  admin: { defaultColumns: ['name', 'slug', 'isPublished'], group: 'Каталог', useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'logo', type: 'relationship', relationTo: 'media' },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true },
  ],
  hooks: { beforeValidate: [formatPageSlug] },
  trash: true,
} satisfies CollectionConfig
