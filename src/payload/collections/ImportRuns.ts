import type { CollectionConfig } from 'payload'

import { adminRead, systemManaged } from '../access/standard'

export const ImportRuns = {
  slug: 'import-runs',
  labels: { plural: 'Запуски импорта', singular: 'Запуск импорта' },
  access: { create: systemManaged, delete: systemManaged, read: adminRead, update: systemManaged },
  admin: { defaultColumns: ['source', 'status', 'total', 'created', 'updated', 'startedAt'], group: 'Импорт', useAsTitle: 'correlationId' },
  fields: [
    { name: 'correlationId', type: 'text', required: true, unique: true, index: true },
    { name: 'source', type: 'relationship', relationTo: 'feed-sources', required: true, index: true },
    { name: 'mode', type: 'select', required: true, options: ['delta', 'full_snapshot'] },
    { name: 'status', type: 'select', defaultValue: 'running', required: true, index: true, options: ['running', 'success', 'suspicious', 'partial_success', 'failed', 'cancelled'] },
    { name: 'startedAt', type: 'date', defaultValue: () => new Date().toISOString(), required: true, index: true },
    { name: 'finishedAt', type: 'date' },
    { name: 'total', type: 'number', defaultValue: 0, min: 0 },
    { name: 'created', type: 'number', defaultValue: 0, min: 0 },
    { name: 'updated', type: 'number', defaultValue: 0, min: 0 },
    { name: 'unchanged', type: 'number', defaultValue: 0, min: 0 },
    { name: 'skipped', type: 'number', defaultValue: 0, min: 0 },
    { name: 'failed', type: 'number', defaultValue: 0, min: 0 },
    { name: 'deactivated', type: 'number', defaultValue: 0, min: 0 },
    { name: 'durationMs', type: 'number', min: 0 },
    { name: 'summary', type: 'textarea', maxLength: 2000 },
    { name: 'streamCompleted', type: 'checkbox', defaultValue: false },
    { name: 'addressFormat', type: 'select', options: ['structured', 'freeform'] },
    { name: 'deactivationAllowed', type: 'checkbox', defaultValue: false },
  ],
} satisfies CollectionConfig
