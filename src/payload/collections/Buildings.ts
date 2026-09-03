import type { CollectionConfig } from 'payload'

import { canDeleteMassCatalog, canMutateMassCatalog, canReadMassCatalog } from '../access/mass-catalog'
import { superAdminFieldAccess } from '../access/capabilities'

const sourceFieldAccess = {
  create: superAdminFieldAccess(),
  update: superAdminFieldAccess(),
}

export const Buildings = {
  slug: 'buildings',
  labels: {
    plural: 'Корпуса',
    singular: 'Корпус',
  },
  access: {
    create: canMutateMassCatalog,
    delete: canDeleteMassCatalog,
    read: canReadMassCatalog,
    update: canMutateMassCatalog,
  },
  admin: {
    defaultColumns: ['title', 'residentialComplex', 'completionLabel', 'isActive', 'updatedAt'],
    group: 'Каталог',
    listSearchableFields: ['title', 'externalId', 'address'],
    useAsTitle: 'title',
  },
  indexes: [
    { fields: ['source', 'externalId'], unique: true },
    { fields: ['residentialComplex', 'isActive'] },
  ],
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    {
      name: 'residentialComplex',
      type: 'relationship',
      index: true,
      label: 'Жилой комплекс',
      relationTo: 'residential-complexes',
      required: true,
    },
    { name: 'address', type: 'text', label: 'Адрес' },
    { name: 'completionLabel', type: 'text', label: 'Срок сдачи' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, index: true, label: 'Порядок' },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true, label: 'На сайте' },
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
