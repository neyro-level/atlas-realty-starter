import type { TaskConfig } from 'payload'

import type { NormalizedFeedRecord } from '@/shared/types/feed-import'

import {
  importNormalizedUnitBatch,
  type NormalizedUnitImportInput,
  type NormalizedUnitImportOutput,
} from '../import/normalized-unit-import'

type TaskContract = {
  input: Omit<NormalizedUnitImportInput, 'records'> & { records: unknown }
  output: NormalizedUnitImportOutput
}

export const importNormalizedUnitsTask: TaskConfig<TaskContract> = {
  slug: 'importNormalizedUnits',
  label: 'Import normalized unit batch',
  concurrency: ({ input }) => `unit-import-source-${input.sourceId}`,
  inputSchema: [
    { name: 'batchKey', type: 'text', required: true },
    { name: 'expectedBatchCount', type: 'number', min: 1, required: true },
    { name: 'importRunId', type: 'number', min: 1, required: true },
    {
      name: 'mode',
      type: 'select',
      options: [
        { label: 'Delta', value: 'delta' },
        { label: 'Full snapshot', value: 'full_snapshot' },
      ],
      required: true,
    },
    { name: 'records', type: 'json', required: true },
    { name: 'snapshotStartedAt', type: 'date', required: true },
    { name: 'sourceId', type: 'number', min: 1, required: true },
    { name: 'sourceKey', type: 'text', required: true },
  ],
  outputSchema: [
    { name: 'alreadyProcessed', type: 'checkbox', required: true },
    { name: 'completed', type: 'checkbox', required: true },
    { name: 'created', type: 'number', required: true },
    { name: 'deactivated', type: 'number', required: true },
    { name: 'received', type: 'number', required: true },
    { name: 'unchanged', type: 'number', required: true },
    { name: 'updated', type: 'number', required: true },
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 5_000, type: 'exponential' },
  },
  handler: async ({ input, req }) => ({
    output: await importNormalizedUnitBatch(req.payload, {
      ...input,
      records: input.records as NormalizedFeedRecord[],
    }),
  }),
  onFail: async ({ input, req }) => {
    const importRunId = (input as Partial<TaskContract['input']> | undefined)?.importRunId
    if (typeof importRunId !== 'number') return
    await req.payload.update({
      collection: 'import-runs',
      id: importRunId,
      context: { systemWrite: true },
      data: {
        failedCount: 1,
        finishedAt: new Date().toISOString(),
        status: 'failed',
        summary: 'Normalized unit import job failed after retries',
      },
      overrideAccess: true,
      req,
    })
  },
}
