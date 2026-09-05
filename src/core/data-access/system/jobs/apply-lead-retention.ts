import type { TaskConfig } from 'payload'

import { applyLeadRetentionPolicy } from '../retention/leads'

type TaskContract = {
  input: { retentionDays?: number | null }
  output: { cutoff: string; processed: number; remaining: boolean }
}

export function createApplyLeadRetentionTask(defaultRetentionDays: number | null): TaskConfig<TaskContract> {
  return {
    slug: 'applyLeadRetention',
    label: 'Apply archived lead retention',
    concurrency: () => 'lead-retention',
    inputSchema: [{ name: 'retentionDays', type: 'number', min: 30, max: 3_650 }],
    outputSchema: [
      { name: 'cutoff', type: 'date', required: true },
      { name: 'processed', type: 'number', required: true },
      { name: 'remaining', type: 'checkbox', required: true },
    ],
    retries: {
      attempts: 2,
      backoff: { delay: 30_000, type: 'exponential' },
    },
    schedule: [{ cron: '0 3 * * *', queue: 'maintenance' }],
    handler: async ({ input, req }) => {
      const retentionDays = input.retentionDays ?? defaultRetentionDays
      if (!retentionDays) throw new Error('LEAD_RETENTION_DAYS is required before the retention task can run')
      return { output: await applyLeadRetentionPolicy(req.payload, retentionDays, req) }
    },
  }
}
