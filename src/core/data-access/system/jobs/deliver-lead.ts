import type { TaskConfig } from 'payload'

import { processLeadDelivery, type ResolveLeadChannelAdapter } from '../leads/delivery'

type TaskContract = { input: { deliveryId: string }; output: { status: string } }

export function createDeliverLeadTask(resolveAdapter: ResolveLeadChannelAdapter): TaskConfig<TaskContract> {
  return {
    slug: 'deliverLead',
    label: 'Deliver lead outbox item',
    concurrency: ({ input }) => `lead-delivery:${input.deliveryId}`,
    inputSchema: [{ name: 'deliveryId', type: 'text', required: true }],
    outputSchema: [{ name: 'status', type: 'text', required: true }],
    retries: 0,
    handler: async ({ input, req }) => ({ output: await processLeadDelivery(req.payload, input.deliveryId, resolveAdapter, req) }),
  }
}
