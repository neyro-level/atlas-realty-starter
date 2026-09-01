import type { ImportError, ImportRun, ImportSource } from '@/payload-types'

import { assertAdminCapability, type AdminQueryContext } from '../lib/context'

export type ImportWorkspace = {
  latest: ImportRun | null
  latestSuccessful: ImportRun | null
  runs: ImportRun[]
  sourceReady: boolean
  sources: ImportSource[]
}

function isImportErrorRecord(value: ImportError | number): value is ImportError {
  return typeof value === 'object' && value !== null
}

export async function getImportWorkspace(context: AdminQueryContext): Promise<ImportWorkspace> {
  assertAdminCapability(context, 'import.read')
  const [runResult, latestSuccessfulResult, sourceResult] = await Promise.all([
    context.payload.find({
      collection: 'import-runs',
      depth: 1,
      limit: 20,
      overrideAccess: false,
      page: 1,
      sort: '-startedAt',
      user: context.user,
    }),
    context.payload.find({
      collection: 'import-runs',
      depth: 1,
      limit: 1,
      overrideAccess: false,
      page: 1,
      sort: '-startedAt',
      user: context.user,
      where: {
        status: {
          in: ['success', 'partial_success'],
        },
      },
    }),
    context.payload.find({
      collection: 'import-sources',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'title',
      user: context.user,
    }),
  ])

  return {
    latest: runResult.docs[0] ?? null,
    latestSuccessful: latestSuccessfulResult.docs[0] ?? null,
    runs: runResult.docs,
    sourceReady: sourceResult.docs.some((source) => source.isActive && source.adapterConfigured),
    sources: sourceResult.docs,
  }
}

export async function getImportRunWorkspace(context: AdminQueryContext, id: string): Promise<ImportRun> {
  assertAdminCapability(context, 'import.read')
  return context.payload.findByID({
    id,
    collection: 'import-runs',
    depth: 2,
    overrideAccess: false,
    user: context.user,
  })
}

export function readImportErrors(run: ImportRun) {
  return (run.errors?.docs ?? []).filter(isImportErrorRecord)
}
