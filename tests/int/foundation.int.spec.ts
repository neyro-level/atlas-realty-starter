import { beforeEach, describe, expect, it } from 'vitest'

import {
  foundationUsers,
  getTestPayload,
  resetFoundationState,
  seedPrivilegedUsers,
} from '../helpers/payload'

describe('foundation access and CRUD rules', () => {
  beforeEach(async () => {
    await resetFoundationState()
  })

  it('assigns SUPER_ADMIN to the first created user', async () => {
    const payload = await getTestPayload()

    const firstUser = await payload.create({
      collection: 'users',
      data: {
        email: foundationUsers.superAdmin.email,
        name: foundationUsers.superAdmin.name,
        password: foundationUsers.superAdmin.password,
        role: 'CONTENT_MANAGER',
      },
      draft: false,
      overrideAccess: true,
    })

    expect(firstUser.role).toBe('SUPER_ADMIN')
  })

  it('applies role-based CRUD and public read access', async () => {
    const payload = await getTestPayload()
    const { contentManager, director, superAdmin } = await seedPrivilegedUsers()

    const createdPage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'Главная страница',
        title: 'Главная страница',
      },
      draft: false,
      overrideAccess: false,
      user: contentManager,
    })

    expect(createdPage.slug).toBe('glavnaya-stranica')

    await expect(
      payload.delete({
        collection: 'pages',
        id: createdPage.id,
        overrideAccess: false,
        user: contentManager,
      }),
    ).rejects.toThrow()

    const updatedSettings = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        brandName: 'Союз Ростов',
        companyName: 'Союз застройщиков Ростов',
        defaultSEO: {
          description: 'SEO по умолчанию для сайта.',
          title: 'Союз Ростов',
        },
        email: 'info@example.com',
        projectName: 'Союз Ростов',
      },
      overrideAccess: false,
      user: director,
    })

    expect(updatedSettings.brandName).toBe('Союз Ростов')

    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: 'forbidden@example.com',
          name: 'Нельзя',
          password: 'Forbidden123!',
          role: 'DIRECTOR',
        },
        draft: false,
        overrideAccess: false,
        user: contentManager,
      }),
    ).rejects.toThrow()

    const managedUser = await payload.create({
      collection: 'users',
      data: {
        email: 'manager@example.com',
        name: 'Новый менеджер',
        password: 'Manager123!',
        role: 'CONTENT_MANAGER',
      },
      draft: false,
      overrideAccess: false,
      user: superAdmin,
    })

    expect(managedUser.role).toBe('CONTENT_MANAGER')

    const publicPage = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        slug: 'Публичная страница',
        title: 'Публичная страница',
      },
      draft: false,
      overrideAccess: true,
    })

    const publicPages = await payload.find({
      collection: 'pages',
      overrideAccess: false,
    })

    expect(publicPages.docs.map((doc) => doc.id)).toContain(publicPage.id)
    expect(publicPages.docs.map((doc) => doc.id)).not.toContain(createdPage.id)

    const deletedPage = await payload.delete({
      collection: 'pages',
      id: createdPage.id,
      overrideAccess: false,
      user: director,
    })

    expect(deletedPage.id).toBe(createdPage.id)
  })
})
