import type { CollectionConfig } from 'payload'

import { canCreateProperties, canDeleteProperties, canReadProperties, canUpdateProperties } from '../access/properties'
import { capabilityFieldAccess, superAdminFieldAccess } from '../access/capabilities'
import {
  ENTITY_ORIGIN_LABELS,
  ENTITY_ORIGINS,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_CATEGORIES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUSES,
} from '../admin/lib/constants'
import { protectPropertyMutation, recordPropertyActivity } from '../hooks/business'

export const Properties = {
  slug: 'properties',
  labels: {
    plural: { en: 'Properties', ru: 'Объекты' },
    singular: { en: 'Property', ru: 'Объект' },
  },
  access: {
    create: canCreateProperties,
    delete: canDeleteProperties,
    read: canReadProperties,
    update: canUpdateProperties,
  },
  admin: {
    defaultColumns: ['title', 'category', 'workflowStatus', 'origin', 'responsibleEmployee', 'updatedAt'],
    group: { en: 'Cabinet', ru: 'Кабинет' },
    listSearchableFields: ['title', 'objectCode', 'publicSlug', 'addressLine'],
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', label: { en: 'Title', ru: 'Название' }, required: true },
    { name: 'objectCode', type: 'text', index: true, admin: { position: 'sidebar' }, label: { en: 'Object code', ru: 'Код объекта' } },
    {
      name: 'externalId',
      type: 'text',
      access: { create: superAdminFieldAccess(), update: superAdminFieldAccess() },
      admin: { position: 'sidebar' },
      index: true,
      label: { en: 'External ID', ru: 'Внешний ID' },
    },
    {
      name: 'origin',
      type: 'select',
      access: { update: superAdminFieldAccess() },
      index: true,
      admin: { position: 'sidebar' },
      defaultValue: 'MANUAL',
      label: { en: 'Origin', ru: 'Источник записи' },
      options: ENTITY_ORIGINS.map((origin) => ({ label: ENTITY_ORIGIN_LABELS[origin], value: origin })),
      required: true,
    },
    {
      name: 'workflowStatus',
      type: 'select',
      access: { update: capabilityFieldAccess('property.manual.publish') },
      index: true,
      admin: { position: 'sidebar' },
      defaultValue: 'draft',
      label: { en: 'Workflow status', ru: 'Статус' },
      options: PROPERTY_STATUSES.map((status) => ({ label: PROPERTY_STATUS_LABELS[status], value: status })),
      required: true,
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      access: { update: capabilityFieldAccess('property.manual.publish') },
      admin: { position: 'sidebar' },
      defaultValue: false,
      index: true,
      label: { en: 'Published on site', ru: 'На сайте' },
    },
    {
      name: 'category',
      type: 'select',
      index: true,
      label: { en: 'Category', ru: 'Категория' },
      options: PROPERTY_CATEGORIES.map((category) => ({ label: PROPERTY_CATEGORY_LABELS[category], value: category })),
      required: true,
    },
    {
      name: 'responsibleEmployee',
      type: 'relationship',
      index: true,
      label: { en: 'Responsible employee', ru: 'Ответственный' },
      relationTo: 'employees',
    },
    {
      name: 'feedSource',
      type: 'relationship',
      access: { create: superAdminFieldAccess(), update: superAdminFieldAccess() },
      label: { en: 'Feed source', ru: 'Источник импорта' },
      relationTo: 'import-sources',
    },
    { name: 'price', type: 'number', label: { en: 'Price', ru: 'Цена' }, min: 0 },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', label: { en: 'City', ru: 'Город' } },
        { name: 'district', type: 'text', label: { en: 'District', ru: 'Район' } },
      ],
    },
    { name: 'addressLine', type: 'text', label: { en: 'Address', ru: 'Адрес' } },
    {
      type: 'row',
      fields: [
        { name: 'rooms', type: 'number', label: { en: 'Rooms', ru: 'Комнат' }, min: 0 },
        {
          name: 'updatedFromSourceAt',
          type: 'date',
          access: { create: superAdminFieldAccess(), update: superAdminFieldAccess() },
          index: true,
          label: { en: 'Updated from source at', ru: 'Дата обновления' },
        },
      ],
    },
    { name: 'publicSlug', type: 'text', index: true, label: { en: 'Public slug', ru: 'Публичный slug' }, unique: true },
    { name: 'description', type: 'textarea', label: { en: 'Description', ru: 'Описание' } },
    {
      name: 'gallery',
      type: 'array',
      access: { update: capabilityFieldAccess('property.media.update') },
      label: { en: 'Gallery', ru: 'Медиа' },
      fields: [
        { name: 'file', type: 'relationship', label: { en: 'File', ru: 'Файл' }, relationTo: 'media', required: true },
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'photo',
          label: { en: 'Kind', ru: 'Тип' },
          options: [
            { label: 'Фотография', value: 'photo' },
            { label: 'Планировка', value: 'floor_plan' },
          ],
          required: true,
        },
        { name: 'isMain', type: 'checkbox', defaultValue: false, label: { en: 'Main image', ru: 'Главное изображение' } },
      ],
    },
    {
      name: 'activity',
      type: 'join',
      admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
      collection: 'admin-activities',
      label: { en: 'Activity', ru: 'История изменений' },
      on: 'property',
    },
  ],
  hooks: {
    afterChange: [recordPropertyActivity],
    beforeChange: [protectPropertyMutation],
  },
} satisfies CollectionConfig
