import { getPayload } from 'payload'

import config from '../src/payload.config'
import { bootstrapKrasnodarComplexes } from '../src/project/bootstrap-krasnodar-complexes'

const payload = await getPayload({ config })
const result = await bootstrapKrasnodarComplexes(payload, {
  allowExisting: process.env.ATLAS_COMPLEXES_ALLOW_EXISTING === 'true',
  refresh: process.env.ATLAS_COMPLEXES_REFRESH === 'true',
})

payload.logger.info(result, 'Atlas Krasnodar complexes bootstrap complete')
process.exit(0)
