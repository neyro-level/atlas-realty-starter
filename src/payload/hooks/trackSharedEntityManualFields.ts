import type { CollectionBeforeChangeHook } from 'payload'

import { normalizeSharedEntityOwnership } from '@/core/data-access/ingest/import-policy'

export const trackSharedEntityManualFields = (trackedFields: readonly string[]): CollectionBeforeChangeHook =>
  ({ data, operation, originalDoc, req }) => {
    if (req.context?.ingest === true || !req.user) return data
    const ownership = normalizeSharedEntityOwnership(data.importOwnership ?? originalDoc?.importOwnership)
    const changed = Object.keys(data).filter((field) => trackedFields.includes(field))
    if (operation !== 'create' && operation !== 'update') return data
    return {
      ...data,
      importOwnership: {
        ...ownership,
        manualFields: [...new Set([...ownership.manualFields, ...changed])].sort(),
      },
    }
  }
