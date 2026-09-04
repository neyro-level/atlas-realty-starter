import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import type { User } from '@/payload-types'
import config from '@/payload.config'
import { canManageSettings, isSuperAdmin } from '@/payload/access/helpers'
import { projectConfig } from '@/project/config'

type QuickLink = {
  description: string
  href: string
  title: string
}

async function getCurrentUser() {
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  const authResult = await payload.auth({ headers: requestHeaders })

  return {
    payload,
    user: (authResult.user as User | null) ?? null,
  }
}

export async function DashboardIntro() {
  const { payload, user } = await getCurrentUser()

  if (!user) {
    return null
  }

  const pagesCountPromise = payload.count({
    collection: 'pages',
    overrideAccess: false,
    user,
  })

  const mediaCountPromise = payload.count({
    collection: 'media',
    overrideAccess: false,
    user,
  })

  const usersCountPromise = isSuperAdmin(user)
    ? payload.count({
        collection: 'users',
        overrideAccess: false,
        user,
      })
    : Promise.resolve({ totalDocs: 0 })

  const [pagesCount, mediaCount, usersCount] = await Promise.all([
    pagesCountPromise,
    mediaCountPromise,
    usersCountPromise,
  ])

  const quickLinks: QuickLink[] = [
    {
      description: `${pagesCount.totalDocs} записей`,
      href: '/admin/collections/pages',
      title: 'Страницы',
    },
    {
      description: `${mediaCount.totalDocs} файлов`,
      href: '/admin/collections/media',
      title: 'Медиа',
    },
  ]

  if (isSuperAdmin(user)) {
    quickLinks.push({
      description: `${usersCount.totalDocs} аккаунтов`,
      href: '/admin/collections/users',
      title: 'Пользователи',
    })
  }

  if (canManageSettings(user)) {
    quickLinks.push({
      description: 'Базовые глобальные настройки starter',
      href: '/admin/globals/site-settings',
      title: 'Настройки',
    })
  }

  return (
    <section className="sz-dashboard">
      <div className="sz-dashboard__header">
        <div>
          <p className="sz-dashboard__eyebrow">{projectConfig.foundationStack}</p>
          <h1 className="sz-dashboard__title">{projectConfig.companyName}</h1>
          <p className="sz-dashboard__lead">
            Payload Admin работает как operational-слой стартового шаблона: здесь живут пользователей, медиа, коллекции и базовые runtime-настройки без клиентского public UI.
          </p>
        </div>
        <div className="sz-dashboard__badge">{user.role}</div>
      </div>

      <div className="sz-dashboard__grid">
        {quickLinks.map((item) => (
          <a className="sz-dashboard__card" href={item.href} key={item.href}>
            <span className="sz-dashboard__card-title">{item.title}</span>
            <span className="sz-dashboard__card-text">{item.description}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

