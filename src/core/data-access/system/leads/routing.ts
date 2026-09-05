import type { Payload } from 'payload'

import type { PublicLeadCommand } from '@/shared/types/public-lead'

export type LeadDeliveryPlan = {
  channel: string
  recipientAgentId?: string
  routeReason: 'property-agent' | 'complex-agent' | 'type-mapping' | 'fallback'
}

export type TestDeliveryMode = 'success' | 'retryable' | 'permanent' | 'unavailable'

const TYPE_AGENT_MAP: Partial<Record<PublicLeadCommand['formType'], string>> = {}

export async function resolveLeadRoute(payload: Payload, command: PublicLeadCommand, testMode?: TestDeliveryMode) {
  let propertyAgentId: string | undefined
  let complexAgentId: string | undefined
  let resolvedComplexId = command.complexId

  if (command.propertyId) {
    const properties = await payload.find({
      collection: 'properties', depth: 0, limit: 1, overrideAccess: true, pagination: false,
      select: { agent: true, complex: true }, where: { and: [
        { id: { equals: command.propertyId } }, { isPublished: { equals: true } }, { status: { in: ['active', 'reserved', 'sold'] } },
      ] },
    })
    const property = properties.docs[0]
    if (!property) throw new Error('lead_context_not_found')
    propertyAgentId = relationID(property.agent)
    resolvedComplexId ??= relationID(property.complex)
  }

  if (!propertyAgentId && resolvedComplexId) {
    const complexes = await payload.find({
      collection: 'residential-complexes', depth: 0, limit: 1, overrideAccess: true, pagination: false,
      select: { responsibleAgent: true }, where: { and: [
        { id: { equals: resolvedComplexId } }, { status: { equals: 'published' } },
      ] },
    })
    const complex = complexes.docs[0]
    if (!complex && command.complexId) throw new Error('lead_context_not_found')
    if (!complex) resolvedComplexId = undefined
    complexAgentId = relationID(complex?.responsibleAgent)
  }

  const mappedAgentId = TYPE_AGENT_MAP[command.formType]
  const recipientAgentId = propertyAgentId ?? complexAgentId ?? mappedAgentId
  const routeReason: LeadDeliveryPlan['routeReason'] = propertyAgentId
    ? 'property-agent'
    : complexAgentId
      ? 'complex-agent'
      : mappedAgentId
        ? 'type-mapping'
        : 'fallback'

  return {
    agentId: recipientAgentId,
    complexId: resolvedComplexId,
    deliveries: [{
      channel: testMode && testMode !== 'unavailable' ? `test-${testMode}` : 'fallback',
      recipientAgentId,
      routeReason,
    }] satisfies LeadDeliveryPlan[],
  }
}

function relationID(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return undefined
}
