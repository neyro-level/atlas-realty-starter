import { z } from 'zod'

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.string().optional(),
  NEXT_PUBLIC_RELEASE_SHA: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
})

const environment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_RELEASE_SHA: process.env.NEXT_PUBLIC_RELEASE_SHA,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
})

export const publicEnvironment = {
  appEnvironment: environment.NEXT_PUBLIC_APP_ENV,
  releaseSHA: environment.NEXT_PUBLIC_RELEASE_SHA,
  sentryDSN: environment.NEXT_PUBLIC_SENTRY_DSN,
}
