import type { CollectionConfig } from 'payload'

import { adminRead, systemManaged } from '../access/standard'

export const LeadDeliveries = {
  slug: 'lead-deliveries',
  labels: { plural: 'Доставки заявок', singular: 'Доставка заявки' },
  access: { create: systemManaged, delete: systemManaged, read: adminRead, update: systemManaged },
  admin: { defaultColumns: ['lead', 'channel', 'status', 'attempts', 'nextAttemptAt'], group: 'Заявки', useAsTitle: 'channel' },
  fields: [
    { name: 'lead', type: 'relationship', relationTo: 'leads', required: true, index: true },
    { name: 'channel', type: 'text', required: true, index: true },
    { name: 'routeReason', type: 'select', required: true, options: ['property-agent', 'complex-agent', 'type-mapping', 'fallback'] },
    { name: 'recipientAgent', type: 'relationship', relationTo: 'agents', index: true },
    { name: 'status', type: 'select', defaultValue: 'pending', required: true, index: true, options: ['pending', 'processing', 'delivered', 'failed', 'dead'] },
    { name: 'attempts', type: 'number', defaultValue: 0, required: true, min: 0 },
    { name: 'nextAttemptAt', type: 'date', index: true },
    { name: 'lockedAt', type: 'date', index: true },
    { name: 'lastAttemptAt', type: 'date', index: true },
    { name: 'deliveredAt', type: 'date' },
    { name: 'idempotencyKey', type: 'text', required: true, unique: true, index: true },
    { name: 'lastError', type: 'textarea', maxLength: 1000 },
  ],
} satisfies CollectionConfig
