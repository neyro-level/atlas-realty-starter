import { z } from 'zod'

const sentryServerEnvironmentSchema = z.object({
  APP_ENV: z.string().optional(),
  NODE_ENV: z.string().optional(),
  RELEASE_SHA: z.string().optional(),
  SENTRY_DSN: z.url().optional(),
})

const environment = sentryServerEnvironmentSchema.parse(process.env)

export const sentryServerEnvironment = {
  dsn: environment.SENTRY_DSN,
  environment: environment.APP_ENV ?? environment.NODE_ENV,
  release: environment.RELEASE_SHA,
}
