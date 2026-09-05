import type { Payload, PayloadRequest } from 'payload'

import { systemContext } from '../operations'

const RETENTION_BATCH_SIZE = 100
const MAX_RECORDS_PER_RUN = 1_000

export type LeadRetentionResult = {
  cutoff: string
  processed: number
  remaining: boolean
}

export async function applyLeadRetentionPolicy(
  payload: Payload,
  retentionDays: number,
  req?: PayloadRequest,
): Promise<LeadRetentionResult> {
  if (!Number.isInteger(retentionDays) || retentionDays < 30 || retentionDays > 3_650) {
    throw new Error('Lead retention period must be an integer between 30 and 3650 days')
  }

  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1_000).toISOString()
  let processed = 0

  while (processed < MAX_RECORDS_PER_RUN) {
    const result = await payload.find({
      collection: 'leads',
      context: systemContext('lead-retention'),
      depth: 0,
      limit: Math.min(RETENTION_BATCH_SIZE, MAX_RECORDS_PER_RUN - processed),
      overrideAccess: true,
      pagination: false,
      req,
      sort: 'createdAt',
      where: {
        and: [
          { createdAt: { less_than_equal: cutoff } },
          { personalDataPurgedAt: { exists: false } },
        ],
      },
    })
    if (result.docs.length === 0) break

    for (const lead of result.docs) {
      await payload.update({
        collection: 'leads',
        context: systemContext('lead-retention'),
        data: {
          email: null,
          message: null,
          name: null,
          normalizedPhone: 'retained-' + lead.id,
          personalDataPurgedAt: new Date().toISOString(),
          phone: 'retained-' + lead.id,
        },
        id: lead.id,
        overrideAccess: true,
        req,
      })
      processed += 1
    }
  }

  const remainingResult = await payload.count({
    collection: 'leads',
    context: systemContext('lead-retention'),
    overrideAccess: true,
    req,
    where: {
      and: [
        { createdAt: { less_than_equal: cutoff } },
        { personalDataPurgedAt: { exists: false } },
      ],
    },
  })

  return { cutoff, processed, remaining: remainingResult.totalDocs > 0 }
}
