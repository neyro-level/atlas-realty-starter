import type { CollectionAfterChangeHook } from 'payload'
import type { Lead } from '@/payload-types'

import type { LeadDeliveryPlan } from './routing'
import { systemContext } from '../operations'

export const createLeadOutbox: CollectionAfterChangeHook<Lead> = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.systemOperation !== 'lead-intake') return doc
  const configuredPlan = req.context.leadDeliveryPlan
  const plan: LeadDeliveryPlan[] = Array.isArray(configuredPlan) && configuredPlan.length > 0
    ? configuredPlan as LeadDeliveryPlan[]
    : [{ channel: 'ams-leads', routeReason: 'fallback' }]
  if (plan !== configuredPlan) req.payload.logger.error({ leadId: doc.id }, 'lead_delivery_plan_fallback')

  for (const item of plan) {
    const delivery = await req.payload.create({
      collection: 'lead-deliveries',
      context: systemContext('lead-outbox'),
      data: {
        attempts: 0,
        channel: item.channel,
        idempotencyKey: `${doc.id}:${item.channel}`,
        lead: doc.id,
        recipientAgent: item.recipientAgentId,
        routeReason: item.routeReason,
        status: 'pending',
      },
      depth: 0,
      overrideAccess: true,
      req,
    })
    await req.payload.jobs.queue({
      input: { deliveryId: String(delivery.id) },
      overrideAccess: true,
      queue: 'lead-deliveries',
      req,
      task: 'deliverLead',
    })
  }
  return doc
}
