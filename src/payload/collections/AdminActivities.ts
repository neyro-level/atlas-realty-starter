import type { CollectionConfig } from 'payload'

import { canReadAdminActivities, denyAdminActivityMutation } from '../access/admin-activities'
import { ADMIN_ACTIVITY_EVENTS, ADMIN_ACTIVITY_LABELS } from '../constants'

export const AdminActivities = {
  slug: 'admin-activities',
  access: {
    create: denyAdminActivityMutation,
    delete: denyAdminActivityMutation,
    read: canReadAdminActivities,
    update: denyAdminActivityMutation,
  },
  admin: {
    defaultColumns: ['event', 'label', 'triggeredBy', 'createdAt'],
    hidden: true,
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'event',
      type: 'select',
      index: true,
      label: {
        en: 'Event',
        ru: 'Событие',
      },
      options: ADMIN_ACTIVITY_EVENTS.map((event) => ({
        label: ADMIN_ACTIVITY_LABELS[event],
        value: event,
      })),
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      label: {
        en: 'Label',
        ru: 'Название',
      },
      required: true,
    },
    {
      name: 'details',
      type: 'textarea',
      label: {
        en: 'Details',
        ru: 'Детали',
      },
    },
    {
      name: 'triggeredBy',
      type: 'text',
      label: {
        en: 'Triggered by',
        ru: 'Кто изменил',
      },
      required: true,
    },
    {
      name: 'lead',
      type: 'relationship',
      label: {
        en: 'Lead',
        ru: 'Заявка',
      },
      relationTo: 'leads',
    },
    {
      name: 'property',
      type: 'relationship',
      label: {
        en: 'Property',
        ru: 'Объект',
      },
      relationTo: 'properties',
    },
    {
      name: 'residentialComplex',
      type: 'relationship',
      label: {
        en: 'Residential complex',
        ru: 'Жилой комплекс',
      },
      relationTo: 'residential-complexes',
    },
    {
      name: 'employee',
      type: 'relationship',
      label: {
        en: 'Employee',
        ru: 'Сотрудник',
      },
      relationTo: 'employees',
    },
    {
      name: 'review',
      type: 'relationship',
      label: {
        en: 'Review',
        ru: 'Отзыв',
      },
      relationTo: 'reviews',
    },
    {
      name: 'office',
      type: 'relationship',
      label: {
        en: 'Office',
        ru: 'Офис',
      },
      relationTo: 'offices',
    },
    {
      name: 'importRun',
      type: 'relationship',
      label: {
        en: 'Import run',
        ru: 'Запуск импорта',
      },
      relationTo: 'import-runs',
    },
    {
      name: 'before',
      type: 'json',
      label: {
        en: 'Before',
        ru: 'До изменения',
      },
    },
    {
      name: 'after',
      type: 'json',
      label: {
        en: 'After',
        ru: 'После изменения',
      },
    },
  ],
} satisfies CollectionConfig
