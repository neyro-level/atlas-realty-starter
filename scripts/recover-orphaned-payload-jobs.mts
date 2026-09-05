import { getPayload } from 'payload'

import { recoverOrphanedPayloadJobs } from '../src/core/data-access/system/jobs/recover-orphaned-payload-jobs'
import config from '../src/payload.config'

const payload = await getPayload({ config })

try {
  const result = await recoverOrphanedPayloadJobs(payload)
  payload.logger.info(result, 'Orphaned Payload jobs recovered before worker start')
} finally {
  await payload.destroy()
}

process.exit(0)
