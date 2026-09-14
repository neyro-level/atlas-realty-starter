import { beforeEach, describe, expect, it } from 'vitest'

import { processLeadDelivery } from '@/core/data-access/system/leads/delivery'
import { recoverLeadDeliveries } from '@/core/data-access/system/leads/recovery'
import { recoverOrphanedPayloadJobs } from '@/core/data-access/system/jobs/recover-orphaned-payload-jobs'
import { applyLeadRetentionPolicy } from '@/core/data-access/system/retention/leads'
import { createPublicLead } from '@/project/leads/create-public-lead'
import { getLeadChannelAdapter } from '@/project/leads/channels'
import { LEAD_CHANNEL_IDEMPOTENCY, LEAD_CHANNEL_PORT_VERSION } from '@/core/ports/lead-channel'
import { getTestPayload, resetFoundationState } from '../helpers/payload'

const command = (key: string) => ({
  company: '', consent: true as const, email: 'lead@example.test', formStartedAt: new Date(Date.now() - 3_000).toISOString(),
  formType: 'general' as const, idempotencyKey: key, message: 'Call me', name: 'Lead', phone: '8 (999) 123-45-67', sourcePage: '/nedvizhimost',
})

describe('Stage 3 transactional lead outbox', () => {
  beforeEach(resetFoundationState)

  it('creates one lead, delivery and durable job atomically and deduplicates submission', async () => {
    const payload = await getTestPayload()
    const created = await createPublicLead(command('lead:atomic:12345678'))
    const duplicate = await createPublicLead(command('lead:atomic:12345678'))
    expect(duplicate).toEqual({ duplicate: true, leadId: created.leadId })
    expect((await payload.count({ collection: 'leads', overrideAccess: true })).totalDocs).toBe(1)
    expect((await payload.count({ collection: 'lead-deliveries', overrideAccess: true })).totalDocs).toBe(1)
    expect((await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs).toBe(1)
  })

  it('links a detail request to its existing complex and keeps a catalog request general', async () => {
    const payload = await getTestPayload()
    const complex = await payload.create({ collection: 'residential-complexes', overrideAccess: true, data: { name: 'ЖК Опера', slug: 'zhk-opera', status: 'published' } })
    const linked = await createPublicLead({ ...command('lead:complex:12345678'), complexId: String(complex.id), formType: 'complex', sourcePage: '/zhk-opera' })
    const catalog = await createPublicLead({ ...command('lead:catalog:12345678'), sourcePage: '/novostroyki' })

    expect(await payload.findByID({ collection: 'leads', id: linked.leadId, depth: 0, overrideAccess: true })).toMatchObject({ complex: String(complex.id), sourcePage: '/zhk-opera' })
    expect(await payload.findByID({ collection: 'leads', id: catalog.leadId, depth: 0, overrideAccess: true })).toMatchObject({ complex: null, sourcePage: '/novostroyki' })
  })

  it('keeps the lead when a channel is unavailable and recovers a retryable delivery', async () => {
    const payload = await getTestPayload()
    const created = await createPublicLead(command('lead:unavailable:12345678'), { testDeliveryMode: 'unavailable' })
    const delivery = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    await expect(processLeadDelivery(payload, String(delivery.id), getLeadChannelAdapter)).resolves.toEqual({ status: 'failed' })
    const failed = await payload.findByID({ collection: 'lead-deliveries', id: delivery.id, overrideAccess: true })
    expect(failed.status).toBe('failed')
    expect(failed.lastError).toBe('channel_unavailable')
    expect((await payload.findByID({ collection: 'leads', id: created.leadId, overrideAccess: true })).id).toBe(created.leadId)
  })

  it('retries transient failure and makes permanent failure dead', async () => {
    const payload = await getTestPayload()
    await createPublicLead(command('lead:retryable:12345678'), { testDeliveryMode: 'retryable' })
    const retryable = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    expect(await processLeadDelivery(payload, String(retryable.id), getLeadChannelAdapter)).toEqual({ status: 'failed' })
    await payload.update({ collection: 'lead-deliveries', data: { nextAttemptAt: new Date(Date.now() - 1_000).toISOString() }, id: retryable.id, overrideAccess: true })
    expect(await processLeadDelivery(payload, String(retryable.id), getLeadChannelAdapter)).toEqual({ status: 'delivered' })

    await createPublicLead(command('lead:permanent:12345678'), { testDeliveryMode: 'permanent' })
    const permanent = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true, sort: '-createdAt' })).docs[0]!
    expect(await processLeadDelivery(payload, String(permanent.id), getLeadChannelAdapter)).toEqual({ status: 'dead' })
  })

  it('delivers through the real Payload Jobs worker', async () => {
    const payload = await getTestPayload()
    await createPublicLead(command('lead:worker:12345678'))
    await payload.jobs.run({ limit: 10, overrideAccess: true, queue: 'lead-deliveries' })
    const delivery = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    expect(delivery.status).toBe('delivered')
    expect(delivery.deliveredAt).toBeTruthy()
  })

  it('returns process-orphaned Payload jobs to the single worker queue', async () => {
    const payload = await getTestPayload()
    await createPublicLead(command('lead:orphaned-job:12345678'))
    const job = (await payload.find({ collection: 'payload-jobs', limit: 1, overrideAccess: true })).docs[0]!
    await payload.update({ collection: 'payload-jobs', data: { processing: true }, id: job.id, overrideAccess: true })

    await expect(recoverOrphanedPayloadJobs(payload)).resolves.toEqual({ recovered: 1 })
    await expect(payload.findByID({ collection: 'payload-jobs', id: job.id, overrideAccess: true })).resolves.toMatchObject({ processing: false })
  })

  it('returns stuck processing deliveries to the worker queue', async () => {
    const payload = await getTestPayload()
    await createPublicLead(command('lead:recovery:12345678'))
    const delivery = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    await payload.update({ collection: 'lead-deliveries', data: { lockedAt: new Date(Date.now() - 11 * 60_000).toISOString(), status: 'processing' }, id: delivery.id, overrideAccess: true })
    await expect(recoverLeadDeliveries(payload)).resolves.toEqual({ queued: 1 })
    const recovered = await payload.findByID({ collection: 'lead-deliveries', id: delivery.id, overrideAccess: true })
    expect(recovered).toMatchObject({ lastError: 'processing_timeout', status: 'failed' })
    const pendingJobs = await payload.find({
      collection: 'payload-jobs', limit: 10, overrideAccess: true,
      where: { and: [{ taskSlug: { equals: 'deliverLead' } }, { completedAt: { exists: false } }] },
    })
    expect(pendingJobs.totalDocs).toBe(1)
  })

  it('uses a safe fallback delivery plan if intake context is incomplete', async () => {
    const payload = await getTestPayload()
    await expect(payload.create({
      collection: 'leads', context: { systemOperation: 'lead-intake' }, draft: false, overrideAccess: true,
      data: { consentVersion: '152-fz-v1', consentedAt: new Date().toISOString(), idempotencyKey: 'lead:rollback:12345678', normalizedPhone: '+79991234567', phone: '+79991234567', status: 'new' },
    })).resolves.toBeTruthy()
    expect((await payload.count({ collection: 'leads', overrideAccess: true })).totalDocs).toBe(1)
    expect((await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]).toMatchObject({ channel: 'ams-leads', status: 'pending' })
  })

  it('claims a delivery once across concurrent workers and reclaims a stale lock', async () => {
    const payload = await getTestPayload()
    await createPublicLead(command('lead:concurrent:12345678'))
    const delivery = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    let delivered = 0
    const resolver = () => ({
      policy: { baseBackoffMs: 1, maxAttempts: 3, maxBackoffMs: 10, timeoutMs: 1000 },
      adapter: { idempotency: LEAD_CHANNEL_IDEMPOTENCY, version: LEAD_CHANNEL_PORT_VERSION, deliver: async () => { delivered += 1; await new Promise((resolve) => setTimeout(resolve, 20)); return { ok: true as const } } },
    })
    const results = await Promise.all([
      processLeadDelivery(payload, String(delivery.id), resolver),
      processLeadDelivery(payload, String(delivery.id), resolver),
    ])
    expect(delivered).toBe(1)
    expect(results.map((item) => item.status).sort()).toEqual(['delivered', 'skipped'])

    await payload.update({ collection: 'lead-deliveries', data: { attempts: 1, deliveredAt: null, lockedAt: new Date(Date.now() - 11 * 60_000).toISOString(), status: 'processing' }, id: delivery.id, overrideAccess: true })
    await expect(processLeadDelivery(payload, String(delivery.id), resolver)).resolves.toEqual({ status: 'delivered' })
    expect(delivered).toBe(2)
  })

  it('rate-limits repeated intake by normalized phone without storing raw client IP', async () => {
    const payload = await getTestPayload()
    for (let index = 0; index < 3; index += 1) {
      await createPublicLead({ ...command(`lead:limit:${index}:12345678`), requestFingerprint: 'a'.repeat(64) })
    }
    await expect(createPublicLead({ ...command('lead:limit:blocked:12345678'), requestFingerprint: 'a'.repeat(64) })).rejects.toThrow(/lead_rate_limited/)
    const stored = (await payload.find({ collection: 'leads', limit: 1, overrideAccess: true })).docs[0]!
    expect(stored.requestFingerprint).toBe('a'.repeat(64))
    expect(stored).not.toHaveProperty('clientIp')
  })

  it('rejects an external source page and rate-limits a fingerprint across different phones', async () => {
    await expect(createPublicLead({ ...command('lead:source:12345678'), sourcePage: 'https://evil.example.test/offer' })).rejects.toThrow(/lead_source_page_forbidden/)

    for (let index = 0; index < 10; index += 1) {
      await createPublicLead({
        ...command(`lead:fingerprint:${index}:12345678`),
        phone: `+7 900 000 00 ${String(index).padStart(2, '0')}`,
        requestFingerprint: 'c'.repeat(64),
      })
    }
    await expect(createPublicLead({
      ...command('lead:fingerprint:blocked:12345678'),
      phone: '+7 900 000 01 00',
      requestFingerprint: 'c'.repeat(64),
    })).rejects.toThrow(/lead_rate_limited/)
  })

  it('purges expired PII without retaining its original values', async () => {
    const payload = await getTestPayload()
    const created = await createPublicLead({ ...command('lead:retention:12345678'), requestFingerprint: 'b'.repeat(64) })
    await payload.update({ collection: 'leads', data: { createdAt: new Date(Date.now() - 31 * 24 * 60 * 60_000).toISOString() }, id: created.leadId, overrideAccess: true })
    const result = await applyLeadRetentionPolicy(payload, 30)
    expect(result.processed).toBe(1)
    const lead = await payload.findByID({ collection: 'leads', id: created.leadId, overrideAccess: true })
    expect(lead).toMatchObject({ email: null, message: null, name: null })
    expect(lead.phone).not.toContain('999')
    expect(lead.normalizedPhone).not.toContain('999')
    expect(lead.requestFingerprint).toBeNull()
    expect(lead.personalDataPurgedAt).toBeTruthy()
  })
})
