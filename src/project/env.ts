import { z } from 'zod'

type EnvironmentSource = Readonly<Record<string, string | undefined>>

type S3RuntimeConfig = {
  accessKeyId: string
  bucket: string
  endpoint?: string
  forcePathStyle: boolean
  region: string
  secretAccessKey: string
}

export type BootstrapUserCredentials = {
  name: string
  password: string
  role: 'DIRECTOR' | 'SUPER_ADMIN'
  username: string
}

type RuntimeEnvironment = 'development' | 'local' | 'production' | 'staging' | 'test'

const environmentSchema = z.object({
  APP_ENV: z.enum(['development', 'local', 'production', 'staging', 'test']).optional(),
  DATABASE_POOL_MAX: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  EXTERNAL_IMAGE_HOSTS: z.string().optional(),
  HEALTH_SECRET: z.string().optional(),
  NEXT_PHASE: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
  PAYLOAD_DIRECTOR_PASSWORD: z.string().optional(),
  PAYLOAD_DIRECTOR_USERNAME: z.string().optional(),
  PAYLOAD_SECRET: z.string().optional(),
  PAYLOAD_SUPERADMIN_PASSWORD: z.string().optional(),
  PAYLOAD_SUPERADMIN_USERNAME: z.string().optional(),
  PRIVACY_HMAC_SECRET: z.string().optional(),
  RELEASE_SHA: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).optional(),
  S3_REGION: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
})

const hostnameSchema = z.string().regex(
  /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
  'External image hosts must be exact hostnames',
)

const usernameSchema = z.string().regex(/^[a-z][a-z0-9._-]{2,63}$/i)
const knownSecretPlaceholders = [
  'change-me-foundation-secret',
  'foundation-test-secret-please-change',
  'test-foundation-secret',
  'visual-verification-secret-only',
  'changeme',
  'change-me',
  'payload-secret',
]

export function buildRuntimeConfig(input: EnvironmentSource) {
  const env = environmentSchema.parse(input)
  const environment = resolveEnvironment(env)
  const production = environment === 'production' || environment === 'staging'
  const persistentStorageRequired = production

  return {
    bootstrapUsers: readBootstrapUsers(env, environment),
    databasePoolMax: readDatabasePoolMax(env.DATABASE_POOL_MAX, environment),
    databaseURL: requireEnvironmentValue('DATABASE_URL', env.DATABASE_URL, environment),
    environment,
    externalImageHosts: readHostAllowlist(env.EXTERNAL_IMAGE_HOSTS),
    healthSecret: readCoreSecret('HEALTH_SECRET', env.HEALTH_SECRET, production),
    leadRetentionDays: 365,
    payloadSecret: validatePayloadSecret(env.PAYLOAD_SECRET, environment),
    privacyHmacSecret: readCoreSecret('PRIVACY_HMAC_SECRET', env.PRIVACY_HMAC_SECRET, production),
    releaseSHA: env.RELEASE_SHA ?? 'local',
    revalidateSecret: readCoreSecret('REVALIDATE_SECRET', env.REVALIDATE_SECRET, production),
    s3: readS3Config(env, persistentStorageRequired),
    siteURL: readSiteURL(env.NEXT_PUBLIC_SITE_URL, production),
  }
}

export const runtimeConfig = buildRuntimeConfig(process.env)

function resolveEnvironment(env: z.infer<typeof environmentSchema>): RuntimeEnvironment {
  if (env.NEXT_PHASE === 'phase-production-build') return 'development'
  return env.APP_ENV ?? (env.NODE_ENV === 'test' ? 'test' : env.NODE_ENV === 'production' ? 'production' : 'development')
}

function requireEnvironmentValue(name: string, value: string | undefined, environment: RuntimeEnvironment) {
  if ((environment === 'production' || environment === 'staging') && !value) {
    throw new Error(`Missing required ${environment} environment variable: ${name}`)
  }
  return value ?? ''
}

function validatePayloadSecret(value: string | undefined, environment: RuntimeEnvironment) {
  if (environment !== 'production' && environment !== 'staging') return value ?? ''
  if (!value) throw new Error(`Missing required ${environment} environment variable: PAYLOAD_SECRET`)

  const normalized = value.trim().toLowerCase()
  if (knownSecretPlaceholders.some((placeholder) => normalized === placeholder || normalized.includes(placeholder))) {
    throw new Error('PAYLOAD_SECRET uses a known placeholder and is forbidden outside development/test')
  }
  return parseStrongSecret('PAYLOAD_SECRET', value)
}

function readCoreSecret(name: string, value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error(`Missing required production environment variable: ${name}`)
    return ''
  }
  return parseStrongSecret(name, value)
}

function parseStrongSecret(name: string, value: string) {
  if (value.length < 32) throw new Error(`${name} must contain at least 32 characters outside development/test`)
  if (/^(.)\1+$/.test(value)) throw new Error(`${name} must not repeat one character`)
  return value
}

function readSiteURL(value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error('Missing required production environment variable: NEXT_PUBLIC_SITE_URL')
    return ''
  }
  const parsed = z.url().parse(value)
  if (required && !parsed.startsWith('https://')) throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS outside development/test')
  return parsed.replace(/\/$/, '')
}

function readDatabasePoolMax(value: string | undefined, environment: RuntimeEnvironment) {
  if (!value) return environment === 'production' || environment === 'staging' ? 2 : 10
  const maximum = Number(value)
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 20) {
    throw new Error('DATABASE_POOL_MAX must be an integer between 1 and 20')
  }
  return maximum
}

function readBootstrapUsers(
  env: z.infer<typeof environmentSchema>,
  environment: RuntimeEnvironment,
): BootstrapUserCredentials[] | null {
  if (environment === 'test' || env.NEXT_PHASE === 'phase-production-build') return null

  const production = environment === 'production' || environment === 'staging'
  const users: BootstrapUserCredentials[] = [
    {
      name: 'Суперадминистратор',
      password: env.PAYLOAD_SUPERADMIN_PASSWORD || (production ? '' : '12341234'),
      role: 'SUPER_ADMIN',
      username: env.PAYLOAD_SUPERADMIN_USERNAME || (production ? '' : 'superadmin'),
    },
    {
      name: 'Директор',
      password: env.PAYLOAD_DIRECTOR_PASSWORD || (production ? '' : '12341234'),
      role: 'DIRECTOR',
      username: env.PAYLOAD_DIRECTOR_USERNAME || (production ? '' : 'director'),
    },
  ]

  for (const user of users) {
    if (!usernameSchema.safeParse(user.username).success) {
      throw new Error(`Invalid or missing ${user.role} bootstrap username`)
    }
    if (user.password.length < 8) {
      throw new Error(`Missing or short ${user.role} bootstrap password; at least 8 characters are required`)
    }
  }
  if (users[0]!.username === users[1]!.username) throw new Error('Bootstrap usernames must be different')
  return users
}

function readHostAllowlist(value: string | undefined) {
  if (!value) return []
  return [...new Set(value.split(',').map((host) => hostnameSchema.parse(host.trim().toLowerCase())).filter(Boolean))]
}

function readS3Config(env: z.infer<typeof environmentSchema>, required: boolean): S3RuntimeConfig | null {
  const configuredValues = [env.S3_BUCKET, env.S3_ACCESS_KEY_ID, env.S3_SECRET_ACCESS_KEY, env.S3_REGION]
  const configuredCount = configuredValues.filter(Boolean).length

  if (configuredCount === 0) {
    if (required) throw new Error('Persistent S3 storage is required outside development/test; local upload storage is forbidden')
    return null
  }
  if (configuredCount !== configuredValues.length) {
    throw new Error('S3 configuration is incomplete. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_REGION together.')
  }

  return {
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    bucket: env.S3_BUCKET!,
    endpoint: env.S3_ENDPOINT || undefined,
    forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
    region: env.S3_REGION!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
  }
}
