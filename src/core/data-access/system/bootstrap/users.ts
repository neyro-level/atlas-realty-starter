import 'server-only'

import type { Payload } from 'payload'

import { systemContext } from '../operations'

export type OwnerBootstrapCredentials = {
  name: string
  password: string
  username: string
}

export async function bootstrapFirstOwner(
  payload: Payload,
  credentials: OwnerBootstrapCredentials,
) {
  const existing = await payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  if (existing.totalDocs !== 0) {
    throw new Error('Owner bootstrap is allowed only when the users collection is empty')
  }

  return payload.create({
    collection: 'users',
    context: systemContext('bootstrap-first-owner'),
    data: {
      ...credentials,
      role: 'owner',
    },
    overrideAccess: true,
  })
}
