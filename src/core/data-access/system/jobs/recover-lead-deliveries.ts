import type { TaskConfig } from 'payload'

import { recoverLeadDeliveries } from '../leads/recovery'

type TaskContract = { input: Record<string, never>; output: { queued: number } }

export const recoverLeadDeliveriesTask: TaskConfig<TaskContract> = {
  slug: 'recoverLeadDeliveries',
  label: 'Recover pending and stuck lead deliveries',
  concurrency: () => 'lead-delivery-recovery',
  inputSchema: [],
  outputSchema: [{ name: 'queued', type: 'number', required: true }],
  retries: 0,
  schedule: [{ cron: '* * * * *', queue: 'lead-deliveries' }],
  handler: async ({ req }) => ({ output: await recoverLeadDeliveries(req.payload, req) }),
}
