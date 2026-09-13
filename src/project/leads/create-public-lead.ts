import 'server-only'

import { getPayload } from 'payload'

import { createPublicLead as createCorePublicLead } from '@/core/data-access/system/leads/create-lead'
import type { TestDeliveryMode } from '@/core/data-access/system/leads/routing'
import config from '@/payload.config'
import type { PublicLeadCommand } from '@/shared/types/public-lead'
import { normalizeAllowedLeadSourcePage } from '@/modules/leads/source-page-policy'

import { runtimeConfig } from '../env'

export async function createPublicLead(command: PublicLeadCommand, options: { testDeliveryMode?: TestDeliveryMode } = {}) {
  const payload = await getPayload({ config })
  const sourcePage = normalizeAllowedLeadSourcePage(command.sourcePage)
  if (!sourcePage) throw new Error('lead_source_page_forbidden')
  const testDeliveryMode = runtimeConfig.environment === 'test'
    ? options.testDeliveryMode ?? 'success'
    : undefined
  return createCorePublicLead(payload, { ...command, sourcePage }, { testDeliveryMode })
}
