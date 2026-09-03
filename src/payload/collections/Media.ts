import type { CollectionConfig } from 'payload'

import { canCreateMedia, canDeleteMedia, canReadMedia, canUpdateMedia } from '../access/media'

export const Media = {
  slug: 'media',
  labels: {
    plural: {
      en: 'Media',
      ru: 'Медиа',
    },
    singular: {
      en: 'Media',
      ru: 'Медиа',
    },
  },
  access: {
    create: canCreateMedia,
    delete: canDeleteMedia,
    read: canReadMedia,
    update: canUpdateMedia,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'isPublic', 'updatedAt'],
    group: {
      en: 'Content',
      ru: 'Контент',
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: {
        en: 'Alt text',
        ru: 'Alt-текст',
      },
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: {
        en: 'Caption',
        ru: 'Подпись',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Publicly available',
        ru: 'Публично доступно',
      },
    },
  ],
  upload: {
    allowRestrictedFileTypes: false,
    focalPoint: true,
    mimeTypes: ['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    pasteURL: false,
    staticDir: 'media',
  },
} satisfies CollectionConfig
