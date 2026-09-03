import type { CollectionConfig } from 'payload'

import { canCreateLeads, canDeleteLeads, canReadLeads, canUpdateLeads } from '../access/leads'
import {
  LEAD_DIRECTION_LABELS,
  LEAD_DIRECTIONS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
} from '../admin/lib/constants'
import { recordLeadActivity, setLeadArchiveMetadata } from '../hooks/business'


export const Leads = {
  slug: 'leads',
  labels: {
    plural: { en: 'Leads', ru: 'Заявки' },
    singular: { en: 'Lead', ru: 'Заявка' },
  },
  access: {
    create: canCreateLeads,
    delete: canDeleteLeads,
    read: canReadLeads,
    update: canUpdateLeads,
  },
  admin: {
    defaultColumns: ['name', 'phone', 'status', 'responsibleEmployee', 'source', 'createdAt'],
    group: { en: 'Cabinet', ru: 'Кабинет' },
    listSearchableFields: ['name', 'phone', 'email', 'sourcePage', 'message'],
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', label: { en: 'Name', ru: 'Имя' } },
    { name: 'phone', type: 'text', label: { en: 'Phone', ru: 'Телефон' }, required: true },
    { name: 'email', type: 'email', label: { en: 'Email', ru: 'Email' } },
    {
      name: 'status',
      type: 'select',
      index: true,
      admin: { position: 'sidebar' },
      defaultValue: 'new',
      label: { en: 'Status', ru: 'Этап воронки' },
      options: LEAD_STATUSES.map((status) => ({ label: LEAD_STATUS_LABELS[status], value: status })),
      required: true,
    },
    {
      name: 'isArchived',
      type: 'checkbox',
      admin: { position: 'sidebar' },
      defaultValue: false,
      index: true,
      label: { en: 'Archived', ru: 'В архиве' },
    },
    {
      name: 'archivedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      index: true,
      label: { en: 'Archived at', ru: 'Дата архивации' },
    },
    {
      name: 'archivedBy',
      type: 'relationship',
      admin: { position: 'sidebar', readOnly: true },
      label: { en: 'Archived by', ru: 'Архивировал' },
      relationTo: 'users',
    },
    {
      name: 'personalDataPurgedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      index: true,
      label: { en: 'Personal data purged at', ru: 'Персональные данные удалены' },
    },
    {
      name: 'responsibleEmployee',
      type: 'relationship',
      index: true,
      admin: { position: 'sidebar' },
      label: { en: 'Responsible employee', ru: 'Ответственный' },
      relationTo: 'employees',
    },
    {
      name: 'direction',
      index: true,
      type: 'select',
      label: { en: 'Direction', ru: 'Направление' },
      options: LEAD_DIRECTIONS.map((direction) => ({ label: LEAD_DIRECTION_LABELS[direction], value: direction })),
    },
    { name: 'formType', type: 'text', index: true, label: { en: 'Form type', ru: 'Форма обращения' } },
    { name: 'source', type: 'text', index: true, label: { en: 'Source', ru: 'Источник' } },
    { name: 'sourcePage', type: 'text', index: true, label: { en: 'Source page', ru: 'Страница' } },
    {
      name: 'visitorKeyHash',
      type: 'text',
      index: true,
      admin: { position: 'sidebar' },
      label: { en: 'Visitor key hash', ru: 'Хэш посетителя' },
    },
    { name: 'interestType', type: 'text', label: { en: 'Interest type', ru: 'Тип интереса' } },
    { name: 'budget', type: 'number', label: { en: 'Budget', ru: 'Бюджет' }, min: 0 },
    { name: 'preferredDistrict', type: 'text', label: { en: 'Preferred district', ru: 'Район' } },
    { name: 'desiredRooms', type: 'number', label: { en: 'Desired rooms', ru: 'Количество комнат' }, min: 0 },
    { name: 'paymentMethod', type: 'text', label: { en: 'Payment method', ru: 'Способ оплаты' } },
    { name: 'purchaseTimeline', type: 'text', label: { en: 'Purchase timeline', ru: 'Срок покупки' } },
    { name: 'nextContactAt', type: 'date', label: { en: 'Next contact at', ru: 'Следующая коммуникация' } },
    { name: 'message', type: 'textarea', label: { en: 'Client comment', ru: 'Комментарий клиента' } },
    {
      name: 'normalizedPhone',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
      label: { en: 'Normalized phone', ru: 'Нормализованный телефон' },
    },
    {
      name: 'duplicateCount',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
      defaultValue: 0,
      label: { en: 'Duplicate count', ru: 'Подавлено дублей' },
      min: 0,
    },
    {
      name: 'lastDuplicateAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      label: { en: 'Last duplicate at', ru: 'Последний дубль' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Notes', ru: 'Заметки' },
          fields: [
            {
              name: 'notes',
              type: 'join',
              admin: { allowCreate: true, defaultColumns: ['body', 'authorName', 'notedAt'] },
              collection: 'lead-notes',
              label: { en: 'Notes', ru: 'Заметки' },
              on: 'lead',
            },
          ],
        },
        {
          label: { en: 'Anti-spam', ru: 'Антиспам-события' },
          fields: [
            {
              name: 'antiSpamAttempts',
              type: 'join',
              admin: { allowCreate: false, defaultColumns: ['verdict', 'reason', 'sourcePage', 'createdAt'] },
              collection: 'anti-spam-events',
              label: { en: 'Anti-spam attempts', ru: 'Антиспам-события' },
              on: 'lead',
            },
          ],
        },
        {
          label: { en: 'Timeline', ru: 'Общий timeline' },
          fields: [
            {
              name: 'activity',
              type: 'join',
              admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
              collection: 'admin-activities',
              label: { en: 'Activity', ru: 'История действий' },
              on: 'lead',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [recordLeadActivity],
    beforeChange: [setLeadArchiveMetadata],
  },
} satisfies CollectionConfig
