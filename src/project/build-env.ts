import { z } from 'zod'

const buildEnvironmentSchema = z.object({
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
})

const buildEnvironment = buildEnvironmentSchema.parse(process.env)

export const sentryBuildConfig =
  buildEnvironment.SENTRY_AUTH_TOKEN && buildEnvironment.SENTRY_ORG && buildEnvironment.SENTRY_PROJECT
    ? {
        authToken: buildEnvironment.SENTRY_AUTH_TOKEN,
        org: buildEnvironment.SENTRY_ORG,
        project: buildEnvironment.SENTRY_PROJECT,
      }
    : null
