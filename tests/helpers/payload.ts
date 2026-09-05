import { getPayload } from 'payload'

import config from '@/payload.config'

export const foundationUsers = {
  contentManager: {
    username: 'content-manager',
    name: 'Контент-менеджер',
    password: 'ContentManager123!',
    role: 'editor' as const,
  },
  director: {
    username: 'director',
    name: 'Директор',
    password: 'Director123!',
    role: 'editor' as const,
  },
  superAdmin: {
    name: 'Суперадмин',
    username: 'superadmin',
    password: 'SuperAdmin123!',
    role: 'owner' as const,
  },
}

export async function getTestPayload() {
  return getPayload({ config })
}

export async function resetFoundationState() {
  const payload = await getTestPayload()
  const collections = [
    'admin-activities',
    'analytics-events',
    'anti-spam-events',
    'import-errors',
    'import-runs',
    'units',
    'buildings',
    'reviews',
    'lead-notes',
    'leads',
    'residential-complexes',
    'properties',
    'offices',
    'employees',
    'import-sources',
    'pages',
    'media',
    'users',
  ] as const

  for (const collection of collections) {
    const { docs } = await payload.find({
      collection,
      depth: 0,
      limit: 500,
      overrideAccess: true,
      pagination: false,
    })

    for (const doc of docs) {
      await payload.delete({
        collection,
        id: doc.id,
        overrideAccess: true,
      })
    }
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      address: 'Тестовый адрес стартового шаблона',
      brandName: 'AMS Realty',
      companyName: 'AMS Realty Platform Starter',
      email: 'info@example.com',
      phone: '+7 (900) 000-00-00',
      telegramUrl: 'https://t.me/test',
      vkUrl: 'https://vk.com/test',
      workingHours: 'Пн-Пт 09:00–18:00',
    },
    overrideAccess: true,
  })
}

export async function seedPrivilegedUsers() {
  const payload = await getTestPayload()

  const superAdmin = await payload.create({
    collection: 'users',
    data: foundationUsers.superAdmin,
    draft: false,
    context: { systemOperation: 'bootstrap-first-owner' },
    overrideAccess: true,
  })

  const director = await payload.create({
    collection: 'users',
    data: foundationUsers.director,
    draft: false,
    overrideAccess: false,
    user: superAdmin,
  })

  const contentManager = await payload.create({
    collection: 'users',
    data: foundationUsers.contentManager,
    draft: false,
    overrideAccess: false,
    user: superAdmin,
  })

  return {
    contentManager,
    director,
    superAdmin,
  }
}


