import type { PostgresAdapter } from '@payloadcms/db-postgres'

import { beforeEach, describe, expect, it } from 'vitest'

import { getTestPayload, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'
import { getLeadsWorkspace, getPropertiesWorkspace } from '@/payload/admin/lib/workspaces'
import { importNormalizedUnitBatch } from '@/payload/import/normalized-unit-import'
import { bootstrapAdminUsersWithCredentials } from '@/payload/bootstrap/users'

describe('admin cabinet parity contracts', () => {
  beforeEach(async () => {
    await resetFoundationState()
  })

  it('denies anonymous user registration even when the users table is empty', async () => {
    const payload = await getTestPayload()
    await expect(payload.create({
      collection: 'users',
      data: { name: 'Anonymous', password: '12341234', role: 'DIRECTOR', username: 'anonymous' },
      overrideAccess: false,
    })).rejects.toThrow()
    expect((await payload.count({ collection: 'users', overrideAccess: true })).totalDocs).toBe(0)
    await expect(payload.forgotPassword({
      collection: 'users',
      data: { email: 'disabled@example.test' },
    })).rejects.toThrow()
  })

  it('bootstraps exactly two username accounts idempotently', async () => {
    const payload = await getTestPayload()
    const users = [
      { name: 'Суперадминистратор', password: '12341234', role: 'SUPER_ADMIN' as const, username: 'superadmin' },
      { name: 'Директор', password: '12341234', role: 'DIRECTOR' as const, username: 'director' },
    ]

    await bootstrapAdminUsersWithCredentials(payload, users)
    const adapter = payload.db as unknown as PostgresAdapter
    const beforeSync = await adapter.pool.query('SELECT "hash" FROM "users" WHERE "username" = $1', ['director'])
    await bootstrapAdminUsersWithCredentials(payload, [
      users[0]!,
      { ...users[1]!, password: '87654321' },
    ])
    const afterSync = await adapter.pool.query('SELECT "hash" FROM "users" WHERE "username" = $1', ['director'])
    expect(afterSync.rows[0]?.hash).not.toBe(beforeSync.rows[0]?.hash)
    await bootstrapAdminUsersWithCredentials(payload, users)
    await bootstrapAdminUsersWithCredentials(payload, users)
    const stored = await payload.find({ collection: 'users', depth: 0, limit: 3, overrideAccess: true, sort: 'username' })
    expect(stored.totalDocs).toBe(2)
    expect(stored.docs.map((user) => [user.username, user.role])).toEqual([
      ['director', 'DIRECTOR'],
      ['superadmin', 'SUPER_ADMIN'],
    ])

    const director = stored.docs.find((user) => user.role === 'DIRECTOR')
    if (!director) throw new Error('Director bootstrap account is missing')
    await expect(payload.update({
      collection: 'users',
      id: director.id,
      data: { password: '1234567' },
      overrideAccess: true,
    })).rejects.toThrow(/at least 8/)
  })


  it('enforces residential complex publication and public read', async () => {
    const payload = await getTestPayload()
    const { contentManager, director } = await seedPrivilegedUsers()

    const draftComplex = await payload.create({
      collection: 'residential-complexes',
      data: {
        address: 'Ростов-на-Дону, тестовый адрес',
        district: 'Советский район',
        slug: 'test-complex',
        status: 'published',
        title: 'ЖК Тестовый',
      },
      overrideAccess: false,
      user: contentManager,
    })

    expect(draftComplex.status).toBe('draft')

    const publishedComplex = await payload.update({
      collection: 'residential-complexes',
      data: {
        status: 'published',
      },
      id: draftComplex.id,
      overrideAccess: false,
      user: director,
    })

    expect(publishedComplex.status).toBe('published')

    const publicComplexes = await payload.find({
      collection: 'residential-complexes',
      overrideAccess: false,
      pagination: false,
    })
    expect(publicComplexes.docs.map((item) => item.slug)).toEqual(['test-complex'])

    const activity = await payload.find({
      collection: 'admin-activities',
      overrideAccess: true,
      pagination: false,
      where: {
        residentialComplex: {
          equals: draftComplex.id,
        },
      },
    })
    expect(activity.docs.map((item) => item.event)).toEqual(
      expect.arrayContaining(['COMPLEX_CREATED', 'COMPLEX_PUBLISHED']),
    )
  })

  it('lets director create and update leads with notes and audit history', async () => {
    const payload = await getTestPayload()
    const { director, superAdmin } = await seedPrivilegedUsers()

    const employee = await payload.create({
      collection: 'employees',
      data: {
        fullName: 'Иван Петров',
        origin: 'MANUAL',
        status: 'active',
        teamSection: 'sales',
      },
      draft: false,
      overrideAccess: false,
      user: director,
    })

    const lead = await payload.create({
      collection: 'leads',
      data: {
        direction: 'flat',
        email: 'lead@example.com',
        formType: 'hero',
        name: 'Новый клиент',
        phone: '+79000000001',
        source: 'yandex',
        sourcePage: '/kvartiry',
        status: 'new',
        visitorKeyHash: 'visitor-1',
      },
      draft: false,
      overrideAccess: false,
      user: director,
    })

    const updatedLead = await payload.update({
      collection: 'leads',
      data: {
        responsibleEmployee: employee.id,
        status: 'in_work',
      },
      id: lead.id,
      overrideAccess: false,
      user: director,
    })

    const note = await payload.create({
      collection: 'lead-notes',
      data: {
        body: 'Перезвонить завтра',
        lead: lead.id,
      },
      draft: false,
      overrideAccess: false,
      user: director,
    })

    expect(updatedLead.status).toBe('in_work')
    expect(note.body).toBe('Перезвонить завтра')
    expect(note.authorName).toBe(director.name)
    expect(typeof updatedLead.responsibleEmployee === 'object' && updatedLead.responsibleEmployee ? updatedLead.responsibleEmployee.id : updatedLead.responsibleEmployee).toBe(employee.id)

    await expect(
      payload.update({
        collection: 'leads',
        data: { status: 'successful' },
        id: lead.id,
        overrideAccess: false,
        user: superAdmin,
      }),
    ).resolves.toBeTruthy()

    const activity = await payload.find({
      collection: 'admin-activities',
      overrideAccess: true,
      pagination: false,
      where: {
        lead: {
          equals: lead.id,
        },
      },
    })
    const activityEvents = activity.docs.map((entry) => entry.event)
    expect(activityEvents).toHaveLength(4)
    expect(activityEvents).toEqual(
      expect.arrayContaining(['LEAD_CREATED', 'LEAD_STAGE_CHANGED', 'LEAD_NOTE_ADDED']),
    )
  })

  it('enforces property permissions and publication workflow', async () => {
    const payload = await getTestPayload()
    const { contentManager } = await seedPrivilegedUsers()

    const property = await payload.create({
      collection: 'properties',
      data: {
        category: 'flat',
        origin: 'XML',
        title: 'Квартира на Пушкинской',
        workflowStatus: 'active',
        isPublished: true,
      },
      draft: false,
      overrideAccess: false,
      user: contentManager,
    })

    expect(property.origin).toBe('MANUAL')
    expect(property.workflowStatus).toBe('draft')
    expect(property.isPublished).toBe(false)

    const publishAttempt = await payload.update({
      collection: 'properties',
      data: {
        isPublished: true,
        workflowStatus: 'active',
      },
      id: property.id,
      overrideAccess: false,
      user: contentManager,
    })

    expect(publishAttempt.isPublished).toBe(false)
    expect(publishAttempt.workflowStatus).toBe('draft')
    const xmlProperty = await payload.create({
      collection: 'properties',
      data: {
        category: 'flat',
        origin: 'XML',
        title: 'Импортный объект',
        workflowStatus: 'active',
      },
      draft: false,
      context: { systemWrite: true },
      overrideAccess: true,
    })

    await expect(
      payload.update({
        collection: 'properties',
        data: {
          title: 'Нельзя менять XML',
        },
        id: xmlProperty.id,
        overrideAccess: false,
        user: contentManager,
      }),
    ).rejects.toThrow()

    await expect(
      payload.delete({
        collection: 'properties',
        id: xmlProperty.id,
        overrideAccess: false,
        user: contentManager,
      }),
    ).rejects.toThrow()
  })

  it('supports review moderation and public published visibility', async () => {
    const payload = await getTestPayload()
    const { director } = await seedPrivilegedUsers()

    const employee = await payload.create({
      collection: 'employees',
      data: {
        fullName: 'Мария Иванова',
        origin: 'MANUAL',
        status: 'active',
        teamSection: 'sales',
      },
      draft: false,
      overrideAccess: false,
      user: director,
    })

    const review = await payload.create({
      collection: 'reviews',
      data: {
        authorName: 'Клиент',
        employee: employee.id,
        rating: 5,
        reviewDate: new Date().toISOString(),
        status: 'pending',
        text: 'Очень помогли с выбором квартиры.',
      },
      draft: false,
      overrideAccess: false,
      user: director,
    })

    const moderatedReview = await payload.update({
      collection: 'reviews',
      data: {
        publishedText: 'Очень помогли с выбором квартиры.',
        status: 'published',
      },
      id: review.id,
      overrideAccess: false,
      user: director,
    })

    expect(moderatedReview.status).toBe('published')

    const publicReviews = await payload.find({
      collection: 'reviews',
      overrideAccess: false,
      pagination: false,
    })

    expect(publicReviews.docs.map((doc) => doc.id)).toContain(review.id)
  })

  it('restricts contacts settings update to director and super admin', async () => {
    const payload = await getTestPayload()
    const { contentManager, director } = await seedPrivilegedUsers()

    const updatedSettings = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        address: 'Ростов-на-Дону, Пушкинская, 5',
        brandName: 'Союз Ростов',
        companyName: 'Союз застройщиков Ростов',
        email: 'office@example.com',
        phone: '+7 (900) 111-11-11',
      },
      overrideAccess: false,
      user: director,
    })

    expect(updatedSettings.phone).toBe('+7 (900) 111-11-11')

    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          phone: '+7 (900) 222-22-22',
        },
        overrideAccess: false,
        user: contentManager,
      }),
    ).rejects.toThrow()
  })

  it('enforces custom workspace capabilities and XML employee field ownership', async () => {
    const payload = await getTestPayload()
    const { contentManager, director } = await seedPrivilegedUsers()

    await expect(getLeadsWorkspace({ payload, user: contentManager }, {})).rejects.toThrow()
    await expect(getLeadsWorkspace({ payload, user: director }, {})).resolves.toMatchObject({
      summary: {
        totalLeads: 0,
      },
    })

    const xmlEmployee = await payload.create({
      collection: 'employees',
      context: { systemWrite: true },
      data: {
        fullName: 'XML сотрудник',
        origin: 'XML',
        status: 'active',
        teamSection: 'sales',
      },
      draft: false,
      overrideAccess: true,
    })

    const updatedEmployee = await payload.update({
      collection: 'employees',
      data: {
        fullName: 'Запрещённое изменение',
        publicName: 'Публичное имя',
      },
      id: xmlEmployee.id,
      overrideAccess: false,
      user: contentManager,
    })

    expect(updatedEmployee.fullName).toBe('XML сотрудник')
    expect(updatedEmployee.publicName).toBe('Публичное имя')

    await expect(
      payload.delete({
        collection: 'employees',
        id: xmlEmployee.id,
        overrideAccess: false,
        user: contentManager,
      }),
    ).rejects.toThrow()
  })

  it('paginates property workspaces on the server', async () => {
    const payload = await getTestPayload()
    const { director } = await seedPrivilegedUsers()
    const properties = Array.from({ length: 45 }, (_, index) => ({
      category: 'flat' as const,
      origin: 'MANUAL' as const,
      price: 5000000 + index,
      title: `Квартира ${index + 1}`,
      workflowStatus: 'draft' as const,
    }))

    await Promise.all(
      properties.map((data) =>
        payload.create({
          collection: 'properties',
          context: { skipAudit: true, systemWrite: true },
          data,
          draft: false,
          overrideAccess: true,
        }),
      ),
    )

    const workspace = await getPropertiesWorkspace({ payload, user: director }, { page: '2' })
    expect(workspace.properties).toHaveLength(20)
    expect(workspace.pagination.total).toBe(45)
    expect(workspace.pagination.totalPages).toBe(3)
  })

  it('stores import history and linked errors without fake parser logic', async () => {
    const payload = await getTestPayload()
    const { director } = await seedPrivilegedUsers()

    const source = await payload.create({
      collection: 'import-sources',
      data: {
        adapterConfigured: false,
        key: 'primary-xml',
        endpointHint: 'https://example.com/feed.xml',
        isActive: true,
        title: 'Основной XML',
      },
      draft: false,
      overrideAccess: false,
      user: director,
    })

    await expect(
      payload.create({
        collection: 'import-runs',
        data: {
          correlationId: 'blocked-user-create',
          mode: 'delta',
          source: source.id,
          startedAt: new Date().toISOString(),
          status: 'running',
          target: 'units',
        },
        draft: false,
        overrideAccess: false,
        user: director,
      }),
    ).rejects.toThrow()

    const run = await payload.create({
      collection: 'import-runs',
      data: {
        correlationId: 'system-partial-run',
        mode: 'delta',
        createdCount: 2,
        failedCount: 1,
        receivedCount: 5,
        source: source.id,
        startedAt: new Date().toISOString(),
        status: 'partial_success',
        summary: 'Один объект не прошёл валидацию.',
        updatedCount: 1,
        target: 'units',
      },
      draft: false,
      overrideAccess: true,
      user: director,
    })

    await payload.create({
      collection: 'import-errors',
      data: {
        code: 'VALIDATION_ERROR',
        externalId: 'xml-42',
        message: 'Не удалось определить категорию объекта.',
        run: run.id,
      },
      draft: false,
      overrideAccess: true,
      user: director,
    })

    const runs = await payload.find({
      collection: 'import-runs',
      depth: 2,
      overrideAccess: false,
      pagination: false,
      user: director,
    })

    expect(runs.docs[0]?.status).toBe('partial_success')
    expect(runs.docs[0]?.errors?.docs?.length).toBe(1)
  })
  it('restores a committed final import batch without double accounting', async () => {
    const payload = await getTestPayload()
    const startedAt = new Date().toISOString()
    const source = await payload.create({
      collection: 'import-sources',
      data: { adapterConfigured: true, isActive: true, key: 'retry-proof', title: 'Retry proof' },
      overrideAccess: true,
    })
    const complex = await payload.create({
      collection: 'residential-complexes',
      data: { slug: 'retry-proof', status: 'draft', title: 'Retry proof' },
      overrideAccess: true,
    })
    const building = await payload.create({
      collection: 'buildings',
      data: {
        externalId: 'building-1',
        importHash: 'building-v1',
        isActive: true,
        lastSeenAt: startedAt,
        residentialComplex: complex.id,
        source: source.id,
        sourceKey: source.key,
        title: 'Building 1',
      },
      overrideAccess: true,
    })
    const run = await payload.create({
      collection: 'import-runs',
      data: {
        correlationId: 'retry-proof',
        expectedBatchCount: 1,
        mode: 'full_snapshot',
        processedBatchKeys: [],
        source: source.id,
        startedAt,
        status: 'running',
        target: 'units',
      },
      overrideAccess: true,
    })
    if (typeof source.id !== 'string' || typeof building.id !== 'string' || typeof complex.id !== 'string' || typeof run.id !== 'string') {
      throw new Error('PostgreSQL integration requires UUID IDs')
    }
    const input = {
      batchKey: 'retry-proof:0',
      expectedBatchCount: 1,
      importRunId: run.id,
      mode: 'full_snapshot' as const,
      records: [{
        contentHash: 'unit-v1',
        externalId: 'unit-1',
        sourceKey: source.key,
        payload: {
          availability: 'available',
          buildingId: building.id,
          floor: 1,
          number: '1',
          price: 5_000_000,
          residentialComplexId: complex.id,
          rooms: 1,
          totalArea: 40,
        },
      }],
      snapshotStartedAt: startedAt,
      sourceId: source.id,
      sourceKey: source.key,
    }

    expect(await importNormalizedUnitBatch(payload, input)).toMatchObject({ alreadyProcessed: false, completed: true, created: 1 })
    expect(await importNormalizedUnitBatch(payload, input)).toMatchObject({ alreadyProcessed: true, completed: true, received: 0 })
    const finalRun = await payload.findByID({ collection: 'import-runs', id: run.id, overrideAccess: true })
    expect(finalRun.receivedCount).toBe(1)
    expect((await payload.count({ collection: 'units', overrideAccess: true })).totalDocs).toBe(1)
  })

})
