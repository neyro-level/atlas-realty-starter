import type { CollectionConfig } from 'payload'

import { canDeleteMassCatalog, canMutateMassCatalog, canReadMassCatalog } from '../access/mass-catalog'
import { superAdminFieldAccess } from '../access/capabilities'

const sourceFieldAccess = {
  create: superAdminFieldAccess(),
  update: superAdminFieldAccess(),
}

export const Units = {
  slug: 'units',
  labels: {
    plural: 'Помещения',
    singular: 'Помещение',
  },
  access: {
    create: canMutateMassCatalog,
    delete: canDeleteMassCatalog,
    read: canReadMassCatalog,
    update: canMutateMassCatalog,
  },
  admin: {
    defaultColumns: ['number', 'building', 'rooms', 'totalArea', 'price', 'availability'],
    group: 'Каталог',
    listSearchableFields: ['number', 'externalId'],
    useAsTitle: 'number',
  },
  indexes: [
    { fields: ['source', 'externalId'], unique: true },
    { fields: ['building', 'availability', 'isActive', 'floor'] },
    { fields: ['residentialComplex', 'availability', 'isActive'] },
  ],
  fields: [
    { name: 'number', type: 'text', index: true, label: 'Номер', required: true },
    {
      name: 'building',
      type: 'relationship',
      index: true,
      label: 'Корпус',
      relationTo: 'buildings',
      required: true,
    },
    {
      name: 'residentialComplex',
      type: 'relationship',
      index: true,
      label: 'Жилой комплекс',
      relationTo: 'residential-complexes',
      required: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'section', type: 'text', index: true, label: 'Секция' },
        { name: 'floor', type: 'number', index: true, label: 'Этаж', required: true },
        { name: 'rooms', type: 'number', index: true, label: 'Комнат', min: 0, required: true },
        { name: 'isStudio', type: 'checkbox', defaultValue: false, index: true, label: 'Студия' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'totalArea', type: 'number', index: true, label: 'Общая площадь', min: 0, required: true },
        { name: 'livingArea', type: 'number', label: 'Жилая площадь', min: 0 },
        { name: 'kitchenArea', type: 'number', label: 'Площадь кухни', min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', index: true, label: 'Цена', min: 0, required: true },
        { name: 'pricePerSquareMeter', type: 'number', index: true, label: 'Цена за м²', min: 0 },
      ],
    },
    {
      name: 'availability',
      type: 'select',
      defaultValue: 'available',
      index: true,
      label: 'Доступность',
      options: [
        { label: 'Доступно', value: 'available' },
        { label: 'Забронировано', value: 'reserved' },
        { label: 'Продано', value: 'sold' },
        { label: 'Скрыто', value: 'hidden' },
      ],
      required: true,
    },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true, label: 'На сайте' },
    { name: 'layout', type: 'relationship', label: 'Планировка', relationTo: 'media' },
    {
      name: 'source',
      type: 'relationship',
      access: sourceFieldAccess,
      index: true,
      label: 'Источник импорта',
      relationTo: 'import-sources',
      required: true,
    },
    { name: 'externalId', type: 'text', access: sourceFieldAccess, index: true, label: 'Внешний ID', required: true },
    { name: 'sourceKey', type: 'text', access: sourceFieldAccess, index: true, label: 'Ключ источника', required: true },
    { name: 'importHash', type: 'text', access: sourceFieldAccess, label: 'Хэш записи', required: true },
    { name: 'lastSeenAt', type: 'date', access: sourceFieldAccess, index: true, label: 'Последнее появление', required: true },
    { name: 'isActive', type: 'checkbox', access: sourceFieldAccess, defaultValue: true, index: true, label: 'Активен' },
  ],
} satisfies CollectionConfig
