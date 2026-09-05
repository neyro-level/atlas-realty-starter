import type { CollectionConfig } from 'payload'

import { adminWrite, ownerOnly, publicOrAdmin } from '../access/standard'
import { formatPageSlug } from '../hooks/formatPageSlug'

export const Posts = {
  slug: 'posts',
  labels: { plural: 'Публикации', singular: 'Публикация' },
  access: { create: adminWrite, delete: ownerOnly, read: publicOrAdmin({ _status: { equals: 'published' } }), readVersions: adminWrite, update: adminWrite },
  admin: { defaultColumns: ['title', 'slug', '_status', 'publishedAt'], group: 'Контент', useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText' },
    { name: 'cover', type: 'relationship', relationTo: 'media' },
    { name: 'publishedAt', type: 'date', index: true },
    { name: 'seo', type: 'group', fields: [{ name: 'title', type: 'text' }, { name: 'description', type: 'textarea', maxLength: 160 }] },
  ],
  hooks: { beforeValidate: [formatPageSlug] },
  versions: { drafts: true, maxPerDoc: 20 },
} satisfies CollectionConfig
