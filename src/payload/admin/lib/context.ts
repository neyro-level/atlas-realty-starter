import { Forbidden, getPayload, type AdminViewServerProps, type Payload } from 'payload'
import { headers } from 'next/headers'

import { hasAdminCapability, isKnownRole, type AdminCapability } from '@/payload/access/capabilities'
import config from '@/payload.config'
import type { User } from '@/payload-types'

export type AdminQueryContext = {
  payload: Payload
  user: User
}

function readUserID(value: unknown) {
  if (!value || typeof value !== 'object' || !('id' in value)) {
    return null
  }

  return typeof value.id === 'string' ? value.id : null
}

function normalizeAdminUser(value: unknown): User | null {
  const id = readUserID(value)
  if (!id || !value || typeof value !== 'object' || !('role' in value) || !isKnownRole(value.role)) {
    return null
  }

  return value as User
}

export async function getAdminViewContext(props: AdminViewServerProps): Promise<AdminQueryContext> {
  const viewUser = normalizeAdminUser(props.initPageResult.req.user ?? props.user)
  if (viewUser) {
    return {
      payload: props.payload,
      user: viewUser,
    }
  }

  return getAdminRequestContext()
}

export async function getAdminRequestContext(): Promise<AdminQueryContext> {
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  const authResult = await payload.auth({ headers: requestHeaders })
  const userID = readUserID(authResult.user)

  if (!userID) {
    throw new Forbidden()
  }

  const user = await payload.findByID({
    collection: 'users',
    depth: 0,
    id: userID,
    overrideAccess: true,
  })

  if (!normalizeAdminUser(user)) {
    throw new Forbidden()
  }

  return {
    payload,
    user,
  }
}

export function assertAdminCapability(context: AdminQueryContext, capability: AdminCapability) {
  if (!hasAdminCapability(context.user, capability)) {
    throw new Forbidden()
  }
}
