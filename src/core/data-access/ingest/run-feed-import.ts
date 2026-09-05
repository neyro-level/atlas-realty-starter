import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import type { PublicCacheTag } from '@/core/cache/public-cache'
import { safeHTTPSStream } from '@/core/security/outbound-http/client'
import { isAllowedExternalImageURL } from '@/shared/security/media-url'
import type { AddressFormat, FeedParser, FeedRunMode, NormalizedOffer } from '@/shared/types/feed-import'

import { evaluateDeactivation } from './import-policy'
import { deactivateMissingProperties, upsertPropertyBatch } from './property-import'

type Client = { query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[] }>; release(): void }
type Source = { code: string; feed_url_ref: string; is_enabled: boolean; last_offer_count: number | null; market: 'secondary' | 'newbuild'; max_offers_limit: number; min_offers_threshold_percent: number; parser: string }
export type FeedImportDependencies = {
  externalImageHosts: readonly string[]
  feedOutboundHosts: readonly string[]
  getFeedParser(name: string): FeedParser
  requestPublicRevalidation(tags: readonly PublicCacheTag[]): Promise<void>
  resolveRuntimeReference(name: string): string | undefined
}

export async function runFeedImport(payload: Payload, input: { mode: FeedRunMode; sourceId: string; signal?: AbortSignal }, dependencies: FeedImportDependencies) {
  const client = await (payload.db as unknown as PostgresAdapter).pool.connect() as unknown as Client
  let source: Source
  let runId: string
  try {
    const result = await client.query<Source>('SELECT code, feed_url_ref, is_enabled, last_offer_count, market, max_offers_limit, min_offers_threshold_percent, parser FROM feed_sources WHERE id = $1', [input.sourceId])
    source = result.rows[0]!
    if (!source?.is_enabled) throw new Error('Feed source is disabled or missing')
    if (source.parser !== `yrl-${source.market}`) throw new Error('Feed parser does not match configured market')
    const run = await client.query<{ id: string }>("INSERT INTO import_runs (correlation_id, source_id, mode, status, started_at, updated_at, created_at) VALUES (gen_random_uuid()::text, $1, $2, 'running', now(), now(), now()) RETURNING id", [input.sourceId, input.mode])
    runId = run.rows[0]!.id
  } finally { client.release() }

  const startedAt = new Date().toISOString()
  const formats = new Set<AddressFormat>()
  const issues: Array<{ code: string; message: string }> = []
  const totals = { created: 0, unchanged: 0, updated: 0, total: 0 }
  const feedURL = dependencies.resolveRuntimeReference(source.feed_url_ref)
  if (!feedURL) {
    issues.push({ code: 'feed-reference-missing', message: 'Feed URL reference is not configured' })
    await finishRun(payload, runId, totals, issues, 'failed', false, formats, startedAt)
    throw new Error(`Feed URL reference is not configured: ${source.feed_url_ref}`)
  }
  const abort = input.signal ?? new AbortController().signal
  let response
  try {
    response = await safeHTTPSStream(feedURL, { allowHosts: dependencies.feedOutboundHosts, maxBytes: 256 * 1024 * 1024, signal: abort, timeoutMs: 60_000 })
  } catch (error) {
    issues.push({ code: 'fetch-failed', message: 'Feed download was rejected or failed' })
    await finishRun(payload, runId, totals, issues, 'failed', false, formats, startedAt)
    throw error
  }
  const parser = dependencies.getFeedParser(source.parser)
  let batch: NormalizedOffer[] = []
  let streamCompleted = false
  try {
    for await (const parsedOffer of parser.parse(response.body, { maxBytes: 256 * 1024 * 1024, maxOfferBytes: 2 * 1024 * 1024, onIssue: (issue) => issues.push(issue), signal: abort })) {
      const rejectedPhotoCount = parsedOffer.photos.filter((url) => !isAllowedExternalImageURL(url, dependencies.externalImageHosts)).length
      if (rejectedPhotoCount) issues.push({ code: 'image-host-denied', message: `${rejectedPhotoCount} external image URL(s) were rejected` })
      const offer = { ...parsedOffer, photos: parsedOffer.photos.filter((url) => isAllowedExternalImageURL(url, dependencies.externalImageHosts)) }
      formats.add(offer.address.format)
      totals.total++
      if (totals.total > source.max_offers_limit) throw new Error('Feed exceeds configured offer limit')
      batch.push(offer)
      if (batch.length === 500) {
        const result = await upsertPropertyBatch(payload, { allowedImageHosts: dependencies.externalImageHosts, feedSourceId: input.sourceId, importRunId: runId, offers: batch, seenAt: startedAt })
        totals.created += result.created; totals.updated += result.updated; totals.unchanged += result.unchanged; batch = []
      }
    }
    if (batch.length) {
      const result = await upsertPropertyBatch(payload, { allowedImageHosts: dependencies.externalImageHosts, feedSourceId: input.sourceId, importRunId: runId, offers: batch, seenAt: startedAt })
      totals.created += result.created; totals.updated += result.updated; totals.unchanged += result.unchanged
    }
    streamCompleted = true
  } catch (error) {
    issues.push({ code: 'stream-failed', message: 'Feed stream did not complete' })
    await finishRun(payload, runId, totals, issues, 'failed', false, formats, startedAt)
    throw error
  }

  const safety = evaluateDeactivation({ enabled: source.is_enabled, lastOfferCount: source.last_offer_count == null ? null : Number(source.last_offer_count), maxOffersLimit: Number(source.max_offers_limit), minOffersThresholdPercent: Number(source.min_offers_threshold_percent), offerCount: totals.total, streamCompleted, criticalIssueCount: issues.filter((issue) => isCriticalIssue(issue.code)).length, addressFormats: formats })
  const deactivated = input.mode === 'full_snapshot' && safety.allowed ? await deactivateMissingProperties(payload, { feedSourceId: input.sourceId, snapshotStartedAt: startedAt }) : 0
  const status: 'success' | 'suspicious' = safety.allowed ? 'success' : 'suspicious'
  await finishRun(payload, runId, { ...totals, deactivated }, [...issues, ...safety.reasons.map((reason) => ({ code: reason, message: 'Safety condition prevented deactivation' }))], status, safety.allowed, formats, startedAt)
  try {
    await dependencies.requestPublicRevalidation(['public:catalog', 'public:sitemap'])
  } catch {
    payload.logger.warn('public cache revalidation request failed; TTL fallback remains active')
  }
  return { ...totals, deactivated, runId, status }
}

async function finishRun(payload: Payload, runId: string, totals: { created: number; unchanged: number; updated: number; total: number; deactivated?: number }, issues: Array<{ code: string; message: string }>, status: 'failed' | 'success' | 'suspicious', deactivationAllowed: boolean, formats: Set<AddressFormat>, startedAt: string) {
  const client = await (payload.db as unknown as PostgresAdapter).pool.connect() as unknown as Client
  try {
    await client.query('BEGIN')
    for (const issue of issues.slice(0, 1000)) await client.query("INSERT INTO import_issues (run_id, severity, code, message, updated_at, created_at) VALUES ($1, $2, $3, $4, now(), now())", [runId, isCriticalIssue(issue.code) ? 'critical' : 'warning', issue.code, issue.message])
    await client.query('UPDATE import_runs SET status=$2, finished_at=now(), total=$3, created=$4, updated=$5, unchanged=$6, failed=$7, deactivated=$8, duration_ms=extract(epoch from (now() - $9::timestamptz))*1000, summary=$10, stream_completed=$11, address_format=$12, deactivation_allowed=$13, updated_at=now() WHERE id=$1', [runId, status, totals.total, totals.created, totals.updated, totals.unchanged, issues.length, totals.deactivated ?? 0, startedAt, `${status}: ${totals.total} offers`, status !== 'failed', formats.size === 1 ? [...formats][0] : null, deactivationAllowed])
    if (status === 'success') await client.query('UPDATE feed_sources SET last_successful_run_at=now(), last_offer_count=$2, updated_at=now() WHERE id=(SELECT source_id FROM import_runs WHERE id=$1)', [runId, totals.total])
    await client.query('COMMIT')
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}

function isCriticalIssue(code: string) {
  return ['fetch-failed', 'feed-reference-missing', 'invalid-offer', 'stream-failed'].includes(code)
}
