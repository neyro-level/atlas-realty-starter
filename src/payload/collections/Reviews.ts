import type { CollectionConfig } from 'payload'

import { canCreateReviews, canDeleteReviews, canReadReviews, canUpdateReviews } from '../access/reviews'
import { REVIEW_STATUS_LABELS, REVIEW_STATUSES } from '../admin/lib/constants'
import { recordReviewActivity } from '../hooks/business'

export const Reviews = {
  slug: 'reviews',
  labels: {
    plural: { en: 'Reviews', ru: 'Отзывы' },
    singular: { en: 'Review', ru: 'Отзыв' },
  },
  access: {
    create: canCreateReviews,
    delete: canDeleteReviews,
    read: canReadReviews,
    update: canUpdateReviews,
  },
  admin: {
    defaultColumns: ['authorName', 'employee', 'rating', 'status', 'reviewDate'],
    group: { en: 'Cabinet', ru: 'Кабинет' },
    listSearchableFields: ['authorName', 'publicName', 'text', 'publishedText'],
    useAsTitle: 'authorName',
  },
  fields: [
    { name: 'authorName', type: 'text', label: { en: 'Author name', ru: 'Автор' }, required: true },
    { name: 'publicName', type: 'text', label: { en: 'Public name', ru: 'Имя в публикации' } },
    {
      name: 'employee',
      type: 'relationship',
      index: true,
      label: { en: 'Employee', ru: 'Сотрудник' },
      relationTo: 'employees',
      required: true,
    },
    { name: 'rating', type: 'number', label: { en: 'Rating', ru: 'Оценка' }, max: 5, min: 1, required: true },
    {
      name: 'status',
      type: 'select',
      index: true,
      admin: { position: 'sidebar' },
      defaultValue: 'pending',
      label: { en: 'Status', ru: 'Статус' },
      options: REVIEW_STATUSES.map((status) => ({ label: REVIEW_STATUS_LABELS[status], value: status })),
      required: true,
    },
    {
      name: 'reviewDate',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
      label: { en: 'Review date', ru: 'Дата' },
      required: true,
    },
    { name: 'text', type: 'textarea', label: { en: 'Original review text', ru: 'Текст отзыва' }, required: true },
    { name: 'publishedText', type: 'textarea', label: { en: 'Published text', ru: 'Текст публикации' } },
    { name: 'authorPhone', type: 'text', label: { en: 'Author phone', ru: 'Телефон автора' } },
    { name: 'consentGiven', type: 'checkbox', defaultValue: false, label: { en: 'Consent given', ru: 'Согласие на публикацию' } },
    {
      name: 'activity',
      type: 'join',
      admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
      collection: 'admin-activities',
      label: { en: 'Activity', ru: 'История модерации' },
      on: 'review',
    },
  ],
  hooks: {
    afterChange: [recordReviewActivity],
  },
} satisfies CollectionConfig
