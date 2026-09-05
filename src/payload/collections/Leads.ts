import type { CollectionConfig } from 'payload'

import { adminRead, adminWrite, ownerOnly, systemManaged } from '../access/standard'

export const Leads = {
  slug: 'leads',
  labels: { plural: 'Заявки', singular: 'Заявка' },
  access: { create: systemManaged, delete: ownerOnly, read: adminRead, update: adminWrite },
  admin: { defaultColumns: ['name', 'phone', 'status', 'agent', 'createdAt'], group: 'Заявки', useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'phone', type: 'text', required: true },
    { name: 'normalizedPhone', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'email', type: 'email' },
    { name: 'message', type: 'textarea' },
    { name: 'status', type: 'select', defaultValue: 'new', required: true, index: true, options: ['new', 'in_progress', 'closed', 'rejected'] },
    { name: 'property', type: 'relationship', relationTo: 'properties', index: true },
    { name: 'complex', type: 'relationship', relationTo: 'residential-complexes', index: true },
    { name: 'agent', type: 'relationship', relationTo: 'agents', index: true },
    { name: 'sourcePage', type: 'text' },
    { name: 'consentVersion', type: 'text', required: true },
    { name: 'consentedAt', type: 'date', required: true },
    { name: 'idempotencyKey', type: 'text', required: true, unique: true, index: true },
    { name: 'personalDataPurgedAt', type: 'date', index: true, admin: { readOnly: true } },
  ],
  trash: true,
} satisfies CollectionConfig
