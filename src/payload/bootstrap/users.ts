import type { Payload } from 'payload'

import { runtimeConfig, type BootstrapUserCredentials } from '@/project/env'

async function ensureBootstrapUser(payload: Payload, credentials: BootstrapUserCredentials) {
  const byUsername = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    where: { username: { equals: credentials.username } },
  })
  if (byUsername.totalDocs > 1) throw new Error(`Duplicate bootstrap username: ${credentials.username}`)
  if (byUsername.docs[0]) {
    if (byUsername.docs[0].role !== credentials.role) {
      throw new Error(`Bootstrap username ${credentials.username} belongs to another role`)
    }
    return byUsername.docs[0]
  }

  const byRole = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    where: { role: { equals: credentials.role } },
  })
  if (byRole.totalDocs > 1) {
    throw new Error(`Cannot assign bootstrap username: more than one ${credentials.role} user exists`)
  }
  if (byRole.docs[0]) {
    return payload.update({
      collection: 'users',
      id: byRole.docs[0].id,
      context: { userBootstrap: true },
      data: {
        password: credentials.password,
        username: credentials.username,
      },
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'users',
    context: { userBootstrap: true },
    data: credentials,
    overrideAccess: true,
  })
}

export async function bootstrapAdminUsersWithCredentials(
  payload: Payload,
  users: BootstrapUserCredentials[],
) {
  for (const credentials of users) {
    await ensureBootstrapUser(payload, credentials)
  }
}

export async function bootstrapAdminUsers(payload: Payload) {
  if (process.argv.some((argument) => argument === 'migrate' || argument.startsWith('migrate:') || argument.startsWith('generate:'))) return
  if (!runtimeConfig.bootstrapUsers) return
  await bootstrapAdminUsersWithCredentials(payload, runtimeConfig.bootstrapUsers)
}
