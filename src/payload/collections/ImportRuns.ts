import type { CollectionConfig } from 'payload'

import { canReadImportRuns, denyImportRunMutation } from '../access/import-runs'
import { IMPORT_STATUS_LABELS, IMPORT_STATUSES } from '../admin/lib/constants'
import { recordImportRunActivity } from '../hooks/business'

export const ImportRuns = {
  slug: 'import-runs',
  labels: {
    plural: { en: 'Import runs', ru: 'Запуски импорта' },
    singular: { en: 'Import run', ru: 'Запуск импорта' },
  },
  access: {
    create: denyImportRunMutation,
    delete: denyImportRunMutation,
    read: canReadImportRuns,
    update: denyImportRunMutation,
  },
  admin: {
    defaultColumns: ['source', 'status', 'receivedCount', 'createdCount', 'updatedCount', 'startedAt'],
    group: { en: 'Cabinet', ru: 'Кабинет' },
    useAsTitle: 'status',
  },
  fields: [
    { name: 'correlationId', type: 'text', index: true, label: { en: 'Correlation ID', ru: 'Correlation ID' }, required: true, unique: true },
    {
      name: 'mode',
      type: 'select',
      label: { en: 'Mode', ru: 'Режим' },
      options: [
        { label: 'Delta', value: 'delta' },
        { label: 'Full snapshot', value: 'full_snapshot' },
      ],
      required: true,
    },
    {
      name: 'target',
      type: 'select',
      label: { en: 'Target', ru: 'Целевая сущность' },
      options: [{ label: 'Units', value: 'units' }],
      required: true,
    },
    { name: 'source', type: 'relationship', index: true, label: { en: 'Source', ru: 'Источник' }, relationTo: 'import-sources', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'running',
      index: true,
      label: { en: 'Status', ru: 'Статус' },
      options: IMPORT_STATUSES.map((status) => ({ label: IMPORT_STATUS_LABELS[status], value: status })),
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startedAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          index: true,
          label: { en: 'Started at', ru: 'Запущен' },
          required: true,
        },
        { name: 'finishedAt', type: 'date', label: { en: 'Finished at', ru: 'Завершён' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'receivedCount', type: 'number', defaultValue: 0, label: { en: 'Received', ru: 'Получено записей' }, min: 0 },
        { name: 'createdCount', type: 'number', defaultValue: 0, label: { en: 'Created', ru: 'Создано' }, min: 0 },
        { name: 'updatedCount', type: 'number', defaultValue: 0, label: { en: 'Updated', ru: 'Обновлено' }, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'skippedCount', type: 'number', defaultValue: 0, label: { en: 'Skipped', ru: 'Пропущено' }, min: 0 },
        { name: 'failedCount', type: 'number', defaultValue: 0, label: { en: 'Failed', ru: 'Ошибки' }, min: 0 },
        { name: 'unchangedCount', type: 'number', defaultValue: 0, label: { en: 'Unchanged', ru: 'Без изменений' }, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'expectedBatchCount', type: 'number', defaultValue: 0, label: { en: 'Expected batches', ru: 'Ожидается пакетов' }, min: 0 },
        { name: 'completedBatchCount', type: 'number', defaultValue: 0, label: { en: 'Completed batches', ru: 'Завершено пакетов' }, min: 0 },
        { name: 'deactivatedCount', type: 'number', defaultValue: 0, label: { en: 'Deactivated', ru: 'Деактивировано' }, min: 0 },
      ],
    },
    {
      name: 'processedBatchKeys',
      type: 'json',
      admin: { hidden: true },
      label: { en: 'Processed batch keys', ru: 'Обработанные пакеты' },
    },
    { name: 'summary', type: 'textarea', label: { en: 'Summary', ru: 'Сводка' } },
    { name: 'diagnostics', type: 'json', label: { en: 'Diagnostics', ru: 'Диагностика' } },
    {
      name: 'errors',
      type: 'join',
      admin: { allowCreate: false, defaultColumns: ['externalId', 'code', 'message', 'createdAt'] },
      collection: 'import-errors',
      label: { en: 'Errors', ru: 'Ошибки объектов' },
      on: 'run',
    },
    {
      name: 'activity',
      type: 'join',
      admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
      collection: 'admin-activities',
      label: { en: 'Activity', ru: 'История запуска' },
      on: 'importRun',
    },
  ],
  hooks: {
    afterChange: [recordImportRunActivity],
  },
} satisfies CollectionConfig
