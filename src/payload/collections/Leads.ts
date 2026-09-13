import type { CollectionConfig } from 'payload'

import { adminRead, adminWrite, ownerOnly, systemManaged } from '../access/standard'
import { createLeadOutbox } from '@/core/data-access/system/leads/outbox-hook'

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
    { name: 'requestFingerprint', type: 'text', index: true, admin: { hidden: true }, access: { read: () => false, update: () => false } },
    { name: 'consentVersion', type: 'text', required: true },
    { name: 'consentedAt', type: 'date', required: true },
    { name: 'idempotencyKey', type: 'text', required: true, unique: true, index: true },
    { name: 'personalDataPurgedAt', type: 'date', index: true, admin: { readOnly: true } },
  ],
  hooks: { afterChange: [createLeadOutbox] },
  trash: true,
} satisfies CollectionConfig
