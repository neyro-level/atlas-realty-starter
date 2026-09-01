import type { Office } from '@/payload-types'

import { assertAdminCapability, type AdminQueryContext } from '../lib/context'

export type OfficesWorkspace = {
  offices: Office[]
}

export async function getOfficesWorkspace(context: AdminQueryContext): Promise<OfficesWorkspace> {
  assertAdminCapability(context, 'office.read')
  const result = await context.payload.find({
    collection: 'offices',
    depth: 1,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    sort: 'sortOrder',
    user: context.user,
  })

  return {
    offices: result.docs,
  }
}
