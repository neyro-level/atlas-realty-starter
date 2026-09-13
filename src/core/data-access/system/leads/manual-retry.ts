import type { PayloadRequest } from 'payload'

import { hasRole } from '@/payload/access/capabilities'

import { systemContext } from '../operations'

export async function retryLeadDelivery(req: PayloadRequest) {
  if (!hasRole(req.user, ['owner', 'editor'])) return Response.json({ error: 'forbidden' }, { status: 403 })
  const deliveryId = String(req.routeParams?.id ?? '')
  if (!deliveryId) return Response.json({ error: 'invalid_request' }, { status: 400 })

  const result = await req.payload.update({
    collection: 'lead-deliveries',
    context: systemContext('lead-recovery'),
    data: { attempts: 0, lastError: null, lockedAt: null, nextAttemptAt: null, status: 'pending' },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    overrideLock: true,
    req,
    where: { and: [{ id: { equals: deliveryId } }, { status: { in: ['dead', 'failed'] } }] },
  })
  if (!result.docs[0]) return Response.json({ error: 'not_retryable' }, { status: 409 })
  await req.payload.jobs.queue({ input: { deliveryId }, overrideAccess: true, queue: 'lead-deliveries', req, task: 'deliverLead' })
  return Response.json({ data: { deliveryId, status: 'pending' } })
}
