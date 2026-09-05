import type { CollectionConfig } from 'payload'

import {
  canCreateResidentialComplexes,
  canDeleteResidentialComplexes,
  canReadResidentialComplexes,
  canUpdateResidentialComplexes,
} from '../access/residential-complexes'
import { capabilityFieldAccess } from '../access/capabilities'
import { formatPageSlug } from '../hooks/formatPageSlug'
import { protectResidentialComplexMutation, recordResidentialComplexActivity } from '@/core/data-access/system/business-hooks'
import { runtimeConfig } from '@/project/env'
import { isAllowedExternalImageURL, validateSafeVideoURL } from '@/shared/security/media-url'

const validateExternalImageURL = (value: unknown) => {
  if (value == null || value === '') return true
  return typeof value === 'string' && isAllowedExternalImageURL(value, runtimeConfig.externalImageHosts)
    ? true
    : 'URL изображения должен использовать HTTPS и разрешённый hostname.'
}


const COMPLEX_STATUSES = [
  { label: 'Черновик', value: 'draft' },
  { label: 'Опубликован', value: 'published' },
  { label: 'Скрыт', value: 'hidden' },
] as const

export const ResidentialComplexes = {
  slug: 'residential-complexes',
  labels: {
    plural: 'Жилые комплексы',
    singular: 'Жилой комплекс',
  },
  access: {
    create: canCreateResidentialComplexes,
    delete: canDeleteResidentialComplexes,
    read: canReadResidentialComplexes,
    update: canUpdateResidentialComplexes,
  },
  admin: {
    defaultColumns: ['title', 'district', 'developer', 'completionLabel', 'priceFrom', 'status'],
    group: 'Каталог',
    listSearchableFields: ['title', 'slug', 'address', 'district', 'developer'],
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', label: { en: 'Title', ru: 'Название' }, required: true },
    { name: 'slug', type: 'text', index: true, label: { en: 'Slug', ru: 'Slug' }, required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      access: { update: capabilityFieldAccess('complex.publish') },
      admin: { position: 'sidebar' },
      defaultValue: 'draft',
      index: true,
      label: { en: 'Status', ru: 'Публикация' },
      options: [...COMPLEX_STATUSES],
      required: true,
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      admin: { position: 'sidebar' },
      defaultValue: false,
      index: true,
      label: { en: 'Featured', ru: 'Показывать на главной' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: { position: 'sidebar' },
      defaultValue: 0,
      label: { en: 'Sort order', ru: 'Порядок' },
    },
    { name: 'shortDescription', type: 'textarea', label: { en: 'Short description', ru: 'Краткое описание' } },
    { name: 'description', type: 'textarea', label: { en: 'Description', ru: 'О жилом комплексе' } },
    {
      type: 'row',
      fields: [
        { name: 'developer', type: 'text', index: true, label: { en: 'Developer', ru: 'Застройщик' } },
        { name: 'completionLabel', type: 'text', index: true, label: { en: 'Completion', ru: 'Срок сдачи' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'district', type: 'text', index: true, label: { en: 'District', ru: 'Район' } },
        { name: 'address', type: 'text', label: { en: 'Address', ru: 'Адрес' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'priceFrom', type: 'number', index: true, label: { en: 'Price from', ru: 'Цена от' }, min: 0 },
        { name: 'areaMin', type: 'number', label: { en: 'Area from', ru: 'Площадь от' }, min: 0 },
        { name: 'areaMax', type: 'number', label: { en: 'Area to', ru: 'Площадь до' }, min: 0 },
      ],
    },
    {
      name: 'roomTypes',
      type: 'select',
      hasMany: true,
      label: { en: 'Room types', ru: 'Планировки' },
      options: [
        { label: 'Студии', value: 'studio' },
        { label: '1-комнатные', value: '1' },
        { label: '2-комнатные', value: '2' },
        { label: '3-комнатные', value: '3' },
        { label: '4-комнатные', value: '4' },
      ],
    },
    {
      name: 'cover',
      type: 'relationship',
      label: { en: 'Cover', ru: 'Обложка' },
      relationTo: 'media',
    },
    {
      name: 'externalCoverUrl',
      type: 'text',
      label: { en: 'External cover URL', ru: 'Внешняя обложка' },
      validate: validateExternalImageURL,
    },
    { name: 'videoUrl', type: 'text', label: { en: 'Video URL', ru: 'Видео' }, validate: validateSafeVideoURL },
    {
      name: 'gallery',
      type: 'array',
      label: { en: 'Gallery', ru: 'Галерея' },
      fields: [
        { name: 'image', type: 'relationship', label: { en: 'Image', ru: 'Медиа' }, relationTo: 'media' },
        { name: 'externalUrl', type: 'text', label: { en: 'External URL', ru: 'Внешний URL' }, validate: validateExternalImageURL },
        { name: 'alt', type: 'text', label: { en: 'Alt', ru: 'Alt-текст' } },
      ],
    },
    {
      name: 'advantages',
      type: 'array',
      label: { en: 'Advantages', ru: 'Преимущества' },
      fields: [
        { name: 'title', type: 'text', label: { en: 'Title', ru: 'Заголовок' }, required: true },
        { name: 'description', type: 'textarea', label: { en: 'Description', ru: 'Описание' } },
      ],
    },
    {
      name: 'purchaseTerms',
      type: 'array',
      label: { en: 'Purchase terms', ru: 'Условия покупки' },
      fields: [
        { name: 'title', type: 'text', label: { en: 'Title', ru: 'Условие' }, required: true },
        { name: 'value', type: 'text', label: { en: 'Value', ru: 'Значение' }, required: true },
      ],
    },
    {
      name: 'location',
      type: 'group',
      label: { en: 'Location', ru: 'Координаты' },
      fields: [
        { name: 'latitude', type: 'number', label: { en: 'Latitude', ru: 'Широта' } },
        { name: 'longitude', type: 'number', label: { en: 'Longitude', ru: 'Долгота' } },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Title' },
        { name: 'description', type: 'textarea', label: 'Description' },
      ],
    },
    {
      name: 'activity',
      type: 'join',
      admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
      collection: 'admin-activities',
      label: { en: 'Activity', ru: 'История изменений' },
      on: 'residentialComplex',
    },
  ],
  hooks: {
    afterChange: [recordResidentialComplexActivity],
    beforeChange: [protectResidentialComplexMutation],
    beforeValidate: [formatPageSlug],
  },
} satisfies CollectionConfig
