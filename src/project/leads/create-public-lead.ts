import 'server-only'

import { getPayload } from 'payload'

import { createPublicLead as createCorePublicLead } from '@/core/data-access/system/leads/create-lead'
import type { TestDeliveryMode } from '@/core/data-access/system/leads/routing'
import config from '@/payload.config'
import type { PublicLeadCommand } from '@/shared/types/public-lead'

import { runtimeConfig } from '../env'

export async function createPublicLead(command: PublicLeadCommand, options: { testDeliveryMode?: TestDeliveryMode } = {}) {
  const payload = await getPayload({ config })
  const testDeliveryMode = runtimeConfig.environment === 'test'
    ? options.testDeliveryMode ?? 'success'
    : undefined
  return createCorePublicLead(payload, command, { testDeliveryMode })
}
