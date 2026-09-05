import 'server-only'

import { getPayload } from 'payload'

import config from '@/payload.config'
import { runtimeConfig } from '@/project/env'
import { LEAD_CONSENT_VERSION, assertMinimumFillTime, normalizeLeadPhone, type PublicLeadCommand } from '@/shared/types/public-lead'

import { systemContext } from '../operations'
import { resolveLeadRoute, type TestDeliveryMode } from './routing'

export type CreateLeadResult = { duplicate: boolean; leadId: string }

export async function createPublicLead(command: PublicLeadCommand, options: { testDeliveryMode?: TestDeliveryMode } = {}): Promise<CreateLeadResult> {
  assertMinimumFillTime(command.formStartedAt)
  const normalizedPhone = normalizeLeadPhone(command.phone)
  const payload = await getPayload({ config })
  const existing = await findExisting(payload, command.idempotencyKey)
  if (existing) return { duplicate: true, leadId: existing }

  const testMode = runtimeConfig.environment === 'test' ? options.testDeliveryMode ?? 'success' : undefined
  const route = await resolveLeadRoute(payload, command, testMode)
  const context = {
    ...systemContext('lead-intake'),
    leadDeliveryPlan: route.deliveries,
  }

  try {
    const lead = await payload.create({
      collection: 'leads',
      context,
      data: {
        agent: route.agentId,
        complex: route.complexId,
        consentVersion: LEAD_CONSENT_VERSION,
        consentedAt: new Date().toISOString(),
        email: command.email,
        idempotencyKey: command.idempotencyKey,
        message: command.message,
        name: command.name,
        normalizedPhone,
        phone: command.phone,
        property: command.propertyId,
        sourcePage: command.sourcePage,
        status: 'new',
      },
      depth: 0,
      draft: false,
      overrideAccess: true,
    })
    return { duplicate: false, leadId: String(lead.id) }
  } catch (error) {
    const raced = await findExisting(payload, command.idempotencyKey)
    if (raced) return { duplicate: true, leadId: raced }
    throw error
  }
}

async function findExisting(payload: Awaited<ReturnType<typeof getPayload>>, idempotencyKey: string) {
  const result = await payload.find({
    collection: 'leads', depth: 0, limit: 1, overrideAccess: true, pagination: false,
    where: { idempotencyKey: { equals: idempotencyKey } },
  })
  return result.docs[0] ? String(result.docs[0].id) : undefined
}
