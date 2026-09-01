import type { CollectionConfig } from 'payload'

import { canReadAnalyticsEvents, denyAnalyticsEventMutation } from '../access/analytics-events'

export const AnalyticsEvents = {
  slug: 'analytics-events',
  access: {
    create: denyAnalyticsEventMutation,
    delete: denyAnalyticsEventMutation,
    read: canReadAnalyticsEvents,
    update: denyAnalyticsEventMutation,
  },
  admin: {
    defaultColumns: ['eventType', 'section', 'page', 'device', 'occurredAt'],
    hidden: true,
    useAsTitle: 'page',
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      index: true,
      label: {
        en: 'Event type',
        ru: 'Тип события',
      },
      options: [
        { label: 'Посещение', value: 'visit' },
        { label: 'Конверсия в заявку', value: 'lead_conversion' },
      ],
      required: true,
    },
    {
      name: 'occurredAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
      label: {
        en: 'Occurred at',
        ru: 'Когда произошло',
      },
      required: true,
    },
    {
      name: 'section',
      type: 'text',
      index: true,
      label: {
        en: 'Section',
        ru: 'Раздел сайта',
      },
    },
    {
      name: 'page',
      type: 'text',
      index: true,
      label: {
        en: 'Page',
        ru: 'Страница',
      },
      required: true,
    },
    {
      name: 'utmSource',
      type: 'text',
      index: true,
      label: {
        en: 'UTM source',
        ru: 'UTM source',
      },
    },
    {
      name: 'device',
      type: 'select',
      index: true,
      label: {
        en: 'Device',
        ru: 'Устройство',
      },
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Unknown', value: 'unknown' },
      ],
      required: true,
    },
    {
      name: 'visitorKeyHash',
      type: 'text',
      index: true,
      label: {
        en: 'Visitor key hash',
        ru: 'Хэш посетителя',
      },
      required: true,
    },
    {
      name: 'sessionKeyHash',
      type: 'text',
      index: true,
      label: {
        en: 'Session key hash',
        ru: 'Хэш сессии',
      },
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
  ],
} satisfies CollectionConfig
