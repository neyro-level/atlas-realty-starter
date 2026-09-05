import 'server-only'

import type { Payload } from 'payload'

import { systemContext } from '../operations'

const RECOVERY_LIMIT = 1_000

export async function recoverOrphanedPayloadJobs(payload: Payload) {
  const jobs = await payload.find({
    collection: 'payload-jobs',
    context: systemContext('recover-orphaned-payload-jobs'),
    depth: 0,
    limit: RECOVERY_LIMIT,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { processing: { equals: true } },
        { completedAt: { exists: false } },
      ],
    },
  })

  for (const job of jobs.docs) {
    await payload.update({
      collection: 'payload-jobs',
      context: systemContext('recover-orphaned-payload-jobs'),
      data: { processing: false },
      depth: 0,
      id: job.id,
      overrideAccess: true,
      overrideLock: true,
    })
  }

  return { recovered: jobs.docs.length }
}
