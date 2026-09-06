import { resolveClientEnv } from '@/shared/config/client-env'

export const publicEnvironment = {
  appEnvironment: process.env.NEXT_PUBLIC_APP_ENV,
  releaseSHA: process.env.NEXT_PUBLIC_RELEASE_SHA,
}

export const clientEnv = resolveClientEnv({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PHASE: process.env.NEXT_PHASE,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_INDEXABLE: process.env.NEXT_PUBLIC_INDEXABLE,
  NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL,
  NEXT_PUBLIC_SITE_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_SITE_MEDIA_BASE_URL,
  NEXT_PUBLIC_YANDEX_MAPS_API_KEY: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
  NEXT_PUBLIC_YANDEX_METRIKA_ID: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
})

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
