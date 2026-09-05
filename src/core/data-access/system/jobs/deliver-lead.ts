import type { TaskConfig } from 'payload'

import { processLeadDelivery } from '../leads/delivery'

type TaskContract = { input: { deliveryId: string }; output: { status: string } }

export const deliverLeadTask: TaskConfig<TaskContract> = {
  slug: 'deliverLead',
  label: 'Deliver lead outbox item',
  concurrency: ({ input }) => `lead-delivery:${input.deliveryId}`,
  inputSchema: [{ name: 'deliveryId', type: 'text', required: true }],
  outputSchema: [{ name: 'status', type: 'text', required: true }],
  retries: 0,
  handler: async ({ input, req }) => ({ output: await processLeadDelivery(req.payload, input.deliveryId, req) }),
}
