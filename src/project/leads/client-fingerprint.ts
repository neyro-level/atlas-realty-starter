import 'server-only'

import { createHmac } from 'node:crypto'

import { runtimeConfig } from '@/project/env'

export function createLeadClientFingerprint(headers: Headers) {
  const address = headers.get('x-real-ip')?.trim()
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!address) return undefined
  const secret = runtimeConfig.payloadSecret || runtimeConfig.revalidateSecret
  if (!secret) return undefined
  return createHmac('sha256', secret).update(address).digest('hex')
}
