import type { TaskConfig } from 'payload'

import { runFeedImport } from './run-feed-import'

type TaskContract = {
  input: { mode: 'delta' | 'full_snapshot'; sourceId: string }
  output: { created: number; deactivated: number; runId: string; status: 'success' | 'suspicious'; total: number; unchanged: number; updated: number }
}

export const importFeedTask: TaskConfig<TaskContract> = {
  slug: 'importFeed',
  label: 'Import allowlisted YRL feed',
  concurrency: ({ input }) => `feed-import-${input.sourceId}`,
  inputSchema: [
    { name: 'sourceId', type: 'text', required: true },
    { name: 'mode', type: 'select', required: true, options: ['delta', 'full_snapshot'] },
  ],
  outputSchema: [
    { name: 'runId', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, options: ['success', 'suspicious'] },
    { name: 'total', type: 'number', required: true },
    { name: 'created', type: 'number', required: true },
    { name: 'updated', type: 'number', required: true },
    { name: 'unchanged', type: 'number', required: true },
    { name: 'deactivated', type: 'number', required: true },
  ],
  retries: { attempts: 1 },
  handler: async ({ input, req }) => ({ output: await runFeedImport(req.payload, input) }),
}
