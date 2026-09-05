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
    'import-issues',
    'import-runs',
    'buildings',
    'lead-deliveries',
    'leads',
    'residential-complexes',
    'properties',
    'developers',
    'agents',
    'feed-sources',
    'redirects',
    'posts',
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
      siteName: 'AMS Realty Platform Starter',
      defaultTitle: 'AMS Realty',
      defaultDescription: 'Headless starter',
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


