import { getPayload } from 'payload'

import { bootstrapFirstOwner } from '../src/core/data-access/system/bootstrap/users'
import config from '../src/payload.config'
import { readBootstrapOwnerEnvironment } from '../src/project/bootstrap-owner-env'

const payload = await getPayload({ config })
const owner = await bootstrapFirstOwner(payload, readBootstrapOwnerEnvironment(process.env))
payload.logger.info({ ownerID: owner.id }, 'First owner created')
process.exit(0)
