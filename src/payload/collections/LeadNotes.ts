import type { CollectionConfig } from 'payload'

import { canCreateLeadNotes, canReadLeadNotes, denyLeadNoteMutation } from '../access/lead-notes'
import { prepareLeadNote, recordLeadNoteActivity } from '../hooks/business'

export const LeadNotes = {
  slug: 'lead-notes',
  labels: {
    plural: { en: 'Lead notes', ru: 'Заметки по заявкам' },
    singular: { en: 'Lead note', ru: 'Заметка по заявке' },
  },
  access: {
    create: canCreateLeadNotes,
    delete: denyLeadNoteMutation,
    read: canReadLeadNotes,
    update: denyLeadNoteMutation,
  },
  admin: {
    defaultColumns: ['lead', 'authorName', 'notedAt'],
    hidden: true,
    useAsTitle: 'authorName',
  },
  fields: [
    {
      name: 'lead',
      type: 'relationship',
      index: true,
      label: { en: 'Lead', ru: 'Заявка' },
      relationTo: 'leads',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      label: { en: 'Note', ru: 'Заметка' },
      required: true,
    },
    {
      name: 'authorName',
      type: 'text',
      admin: { readOnly: true },
      label: { en: 'Author', ru: 'Кто добавил' },
    },
    {
      name: 'notedAt',
      type: 'date',
      admin: { readOnly: true },
      defaultValue: () => new Date().toISOString(),
      index: true,
      label: { en: 'Noted at', ru: 'Когда добавлено' },
    },
  ],
  hooks: {
    afterChange: [recordLeadNoteActivity],
    beforeChange: [prepareLeadNote],
  },
} satisfies CollectionConfig
