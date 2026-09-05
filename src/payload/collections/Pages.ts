import type { CollectionConfig } from 'payload'

import { canCreatePages, canDeletePages, canReadPages, canUpdatePages } from '../access/pages'
import { formatPageSlug } from '../hooks/formatPageSlug'
import { collectionCacheHooks } from '@/core/cache/public-cache'

export const Pages = {
  slug: 'pages',
  labels: {
    plural: {
      en: 'Pages',
      ru: 'Страницы',
    },
    singular: {
      en: 'Page',
      ru: 'Страница',
    },
  },
  access: {
    create: canCreatePages,
    delete: canDeletePages,
    read: canReadPages,
    readVersions: canReadPages,
    update: canUpdatePages,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: {
      en: 'Content',
      ru: 'Контент',
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        ru: 'Заголовок',
      },
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      index: true,
      label: {
        en: 'Slug',
        ru: 'Slug',
      },
      required: true,
      unique: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: {
        en: 'Content',
        ru: 'Содержимое',
      },
    },
  ],
  hooks: {
    ...collectionCacheHooks(['public:content', 'public:sitemap']),
    beforeValidate: [formatPageSlug],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
} satisfies CollectionConfig
