import type { CollectionConfig } from 'payload'

import { canReadAntiSpamEvents, denyAntiSpamEventMutation } from '../access/anti-spam-events'
import { ANTI_SPAM_VERDICT_LABELS, ANTI_SPAM_VERDICTS } from '../admin/lib/constants'

export const AntiSpamEvents = {
  slug: 'anti-spam-events',
  labels: {
    plural: {
      en: 'Anti-spam events',
      ru: 'Антиспам',
    },
    singular: {
      en: 'Anti-spam event',
      ru: 'Антиспам-событие',
    },
  },
  access: {
    create: denyAntiSpamEventMutation,
    delete: denyAntiSpamEventMutation,
    read: canReadAntiSpamEvents,
    update: denyAntiSpamEventMutation,
  },
  admin: {
    defaultColumns: ['verdict', 'sourcePage', 'reason', 'lead', 'createdAt'],
    group: {
      en: 'Cabinet',
      ru: 'Кабинет',
    },
    useAsTitle: 'reason',
  },
  fields: [
    {
      name: 'verdict',
      type: 'select',
      index: true,
      label: {
        en: 'Verdict',
        ru: 'Вердикт',
      },
      options: ANTI_SPAM_VERDICTS.map((verdict) => ({
        label: ANTI_SPAM_VERDICT_LABELS[verdict],
        value: verdict,
      })),
      required: true,
    },
    {
      name: 'reason',
      type: 'text',
      index: true,
      label: {
        en: 'Reason',
        ru: 'Причина',
      },
    },
    {
      name: 'sourcePage',
      type: 'text',
      index: true,
      label: {
        en: 'Source page',
        ru: 'Страница',
      },
    },
    {
      name: 'formType',
      type: 'text',
      index: true,
      label: {
        en: 'Form type',
        ru: 'Форма',
      },
    },
    {
      name: 'lead',
      type: 'relationship',
      label: {
        en: 'Lead',
        ru: 'Связанная заявка',
      },
      relationTo: 'leads',
    },
    {
      name: 'clientIpHash',
      type: 'text',
      index: true,
      label: {
        en: 'Client IP hash',
        ru: 'Хэш IP',
      },
    },
    {
      name: 'visitorKeyHash',
      type: 'text',
      index: true,
      label: {
        en: 'Visitor hash',
        ru: 'Хэш посетителя',
      },
    },
    {
      name: 'requestFingerprintHash',
      type: 'text',
      label: {
        en: 'Request fingerprint hash',
        ru: 'Хэш отпечатка запроса',
      },
    },
  ],
} satisfies CollectionConfig
