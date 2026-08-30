import { getPayload } from 'payload'

import config from '@/payload.config'

export const foundationUsers = {
  contentManager: {
    email: 'content.manager@example.com',
    name: 'Контент-менеджер',
    password: 'ContentManager123!',
    role: 'CONTENT_MANAGER' as const,
  },
  director: {
    email: 'director@example.com',
    name: 'Директор',
    password: 'Director123!',
    role: 'DIRECTOR' as const,
  },
  superAdmin: {
    email: 'superadmin@example.com',
    name: 'Суперадмин',
    password: 'SuperAdmin123!',
    role: 'SUPER_ADMIN' as const,
  },
}

export async function getTestPayload() {
  return getPayload({ config })
}

export async function resetFoundationState() {
  const payload = await getTestPayload()
  const collections = ['pages', 'media', 'users'] as const

  for (const collection of collections) {
    const { docs } = await payload.find({
      collection,
      depth: 0,
      limit: 100,
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
      brandName: 'Союз Застройщиков',
      companyName: 'Союз застройщиков Ростов',
      defaultSEO: {
        description: 'Базовое SEO foundation-слоя.',
        title: 'Союз Ростов',
      },
      projectName: 'Союз Ростов',
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
