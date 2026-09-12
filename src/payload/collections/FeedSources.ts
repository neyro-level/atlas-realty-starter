import type { CollectionConfig } from 'payload'

import { adminRead, ownerOnly } from '../access/standard'
import { validateFeedFieldOwnership } from '@/core/data-access/ingest/import-policy'
import { validateRuntimeReferenceName } from '@/shared/security/runtime-reference'

export const FeedSources = {
  slug: 'feed-sources',
  labels: { plural: 'Источники фидов', singular: 'Источник фида' },
  access: { create: ownerOnly, delete: ownerOnly, read: adminRead, update: ownerOnly },
  admin: { defaultColumns: ['title', 'code', 'market', 'parser', 'isEnabled', 'priority'], group: 'Импорт', useAsTitle: 'title' },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'market', type: 'select', required: true, options: ['secondary', 'newbuild'] },
    { name: 'parser', type: 'select', required: true, options: ['yrl-secondary', 'yrl-newbuild'] },
    { name: 'feedUrlRef', type: 'text', required: true, validate: validateRuntimeReferenceName, admin: { description: 'Имя переменной окружения; URL в БД не хранится.' } },
    { name: 'credentialRef', type: 'text', validate: validateRuntimeReferenceName, admin: { description: 'Имя переменной окружения; секрет в БД не хранится.' } },
    { name: 'isEnabled', type: 'checkbox', defaultValue: false, index: true },
    { name: 'priority', type: 'number', defaultValue: 100, min: 0, required: true },
    { name: 'fieldOwnership', type: 'json', defaultValue: {}, validate: validateFeedFieldOwnership, admin: { description: 'Явный владелец импортируемого поля: ключ вида complex.name или building.address, значение — code источника.' } },
    { name: 'minOffersThresholdPercent', type: 'number', defaultValue: 70, min: 0, max: 100, required: true },
    { name: 'maxOffersLimit', type: 'number', defaultValue: 50000, min: 1, required: true },
    { name: 'publicationMode', type: 'select', defaultValue: 'review', required: true, options: ['review', 'automatic'], admin: { description: 'review — новые объекты остаются скрытыми; automatic — валидные объекты публикуются только после успешного полного импорта.' } },
    { name: 'lastSuccessfulRunAt', type: 'date', index: true },
    { name: 'lastOfferCount', type: 'number', min: 0 },
  ],
} satisfies CollectionConfig
