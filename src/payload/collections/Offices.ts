import type { CollectionConfig } from 'payload'

import { canCreateOffices, canDeleteOffices, canReadOffices, canUpdateOffices } from '../access/offices'
import { recordOfficeActivity } from '@/core/data-access/system/business-hooks'

export const Offices = {
  slug: 'offices',
  labels: {
    plural: {
      en: 'Offices',
      ru: 'Офисы',
    },
    singular: {
      en: 'Office',
      ru: 'Офис',
    },
  },
  access: {
    create: canCreateOffices,
    delete: canDeleteOffices,
    read: canReadOffices,
    update: canUpdateOffices,
  },
  admin: {
    defaultColumns: ['title', 'address', 'sortOrder', 'isPublished', 'updatedAt'],
    group: {
      en: 'Cabinet',
      ru: 'Кабинет',
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        ru: 'Название',
      },
      required: true,
    },
    {
      name: 'address',
      type: 'textarea',
      label: {
        en: 'Address',
        ru: 'Адрес',
      },
      required: true,
    },
    {
      name: 'photo',
      type: 'relationship',
      label: {
        en: 'Photo',
        ru: 'Фото',
      },
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      label: {
        en: 'Sort order',
        ru: 'Порядок сортировки',
      },
      required: true,
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: {
        en: 'Published on site',
        ru: 'Статус публикации',
      },
    },
    {
      name: 'activity',
      type: 'join',
      admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
      collection: 'admin-activities',
      label: { en: 'Activity', ru: 'История изменений' },
      on: 'office',
    },
  ],
  hooks: {
    afterChange: [recordOfficeActivity],
  },
} satisfies CollectionConfig
