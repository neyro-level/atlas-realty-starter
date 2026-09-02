export type FeedRunMode = 'delta' | 'full_snapshot'

export type FeedRecordIdentity = {
  externalId: string
  sourceKey: string
}

export type NormalizedFeedRecord = FeedRecordIdentity & {
  contentHash: string
  payload: Record<string, unknown>
}

export type FeedRecordError = {
  code: string
  externalId?: string
  message: string
  recordIndex?: number
}

export type FeedAdapterResult = {
  errors: FeedRecordError[]
  mode: FeedRunMode
  records: NormalizedFeedRecord[]
  sourceKey: string
}

export type FeedAdapterContext = {
  maxBytes: number
  signal: AbortSignal
  sourceKey: string
}

/**
 * A concrete adapter is client-owned and may only be implemented from an approved
 * feed specification and fixture. Core import orchestration consumes this result;
 * it never guesses XML shape or client field mapping.
 */
export interface FeedAdapter {
  parse(input: Uint8Array, context: FeedAdapterContext): Promise<FeedAdapterResult>
}
