import { beforeEach, describe, expect, it } from 'vitest'

import { createPublicLead } from '@/core/data-access/system/leads/create-lead'
import { processLeadDelivery } from '@/core/data-access/system/leads/delivery'
import { recoverLeadDeliveries } from '@/core/data-access/system/leads/recovery'
import { recoverOrphanedPayloadJobs } from '@/core/data-access/system/jobs/recover-orphaned-payload-jobs'
import { applyLeadRetentionPolicy } from '@/core/data-access/system/retention/leads'
import { getTestPayload, resetFoundationState } from '../helpers/payload'

const command = (key: string) => ({
  company: '', consent: true as const, email: 'lead@example.test', formStartedAt: new Date(Date.now() - 3_000).toISOString(),
  formType: 'general' as const, idempotencyKey: key, message: 'Call me', name: 'Lead', phone: '8 (999) 123-45-67', sourcePage: '/catalog',
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

  it('keeps the lead when a channel is unavailable and recovers a retryable delivery', async () => {
    const payload = await getTestPayload()
    const created = await createPublicLead(command('lead:unavailable:12345678'), { testDeliveryMode: 'unavailable' })
    const delivery = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    await expect(processLeadDelivery(payload, String(delivery.id))).resolves.toEqual({ status: 'dead' })
    const failed = await payload.findByID({ collection: 'lead-deliveries', id: delivery.id, overrideAccess: true })
    expect(failed.status).toBe('dead')
    expect(failed.lastError).toBe('channel_unavailable')
    expect((await payload.findByID({ collection: 'leads', id: created.leadId, overrideAccess: true })).id).toBe(created.leadId)
  })

  it('retries transient failure and makes permanent failure dead', async () => {
    const payload = await getTestPayload()
    await createPublicLead(command('lead:retryable:12345678'), { testDeliveryMode: 'retryable' })
    const retryable = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true })).docs[0]!
    expect(await processLeadDelivery(payload, String(retryable.id))).toEqual({ status: 'failed' })
    await payload.update({ collection: 'lead-deliveries', data: { nextAttemptAt: new Date(Date.now() - 1_000).toISOString() }, id: retryable.id, overrideAccess: true })
    expect(await processLeadDelivery(payload, String(retryable.id))).toEqual({ status: 'delivered' })

    await createPublicLead(command('lead:permanent:12345678'), { testDeliveryMode: 'permanent' })
    const permanent = (await payload.find({ collection: 'lead-deliveries', limit: 1, overrideAccess: true, sort: '-createdAt' })).docs[0]!
    expect(await processLeadDelivery(payload, String(permanent.id))).toEqual({ status: 'dead' })
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
  })

  it('rolls back a lead if its required outbox plan is absent', async () => {
    const payload = await getTestPayload()
    await expect(payload.create({
      collection: 'leads', context: { systemOperation: 'lead-intake' }, draft: false, overrideAccess: true,
      data: { consentVersion: '152-fz-v1', consentedAt: new Date().toISOString(), idempotencyKey: 'lead:rollback:12345678', normalizedPhone: '+79991234567', phone: '+79991234567', status: 'new' },
    })).rejects.toThrow(/delivery plan/)
    expect((await payload.count({ collection: 'leads', overrideAccess: true })).totalDocs).toBe(0)
  })

  it('purges expired PII without retaining its original values', async () => {
    const payload = await getTestPayload()
    const created = await createPublicLead(command('lead:retention:12345678'))
    await payload.update({ collection: 'leads', data: { createdAt: new Date(Date.now() - 31 * 24 * 60 * 60_000).toISOString() }, id: created.leadId, overrideAccess: true })
    const result = await applyLeadRetentionPolicy(payload, 30)
    expect(result.processed).toBe(1)
    const lead = await payload.findByID({ collection: 'leads', id: created.leadId, overrideAccess: true })
    expect(lead).toMatchObject({ email: null, message: null, name: null })
    expect(lead.phone).not.toContain('999')
    expect(lead.normalizedPhone).not.toContain('999')
    expect(lead.personalDataPurgedAt).toBeTruthy()
  })
})
