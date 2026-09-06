import { z } from 'zod'

type EnvironmentSource = Readonly<Record<string, string | undefined>>
type RuntimeEnvironment = 'development' | 'local' | 'production' | 'staging' | 'test'

type S3RuntimeConfig = {
  accessKeyId: string
  bucket: string
  endpoint?: string
  forcePathStyle: boolean
  region: string
  secretAccessKey: string
}

const environmentSchema = z.object({
  APP_ENV: z.enum(['development', 'local', 'production', 'staging', 'test']).optional(),
  DATABASE_POOL_MAX: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  EXTERNAL_IMAGE_HOSTS: z.string().optional(),
  FEED_OUTBOUND_HOSTS: z.string().optional(),
  LOCAL_FULL_CATALOG: z.enum(['true', 'false']).optional(),
  NEXT_PHASE: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
  PAYLOAD_SECRET: z.string().optional(),
  RELEASE_SHA: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).optional(),
  S3_REGION: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  SITE_ENGINE: z.enum(['fixture', 'payload']).optional(),
})

const hostnameSchema = z.string().regex(
  /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
  'Outbound allowlist entries must be exact hostnames',
)

const knownSecretPlaceholders = ['change-me', 'changeme', 'payload-secret', 'test-foundation-secret']

export function buildRuntimeConfig(input: EnvironmentSource) {
  const env = environmentSchema.parse(input)
  const environment = resolveEnvironment(env)
  const protectedRuntime = environment === 'production' || environment === 'staging'
  const siteURL = readSiteURL(env.NEXT_PUBLIC_SITE_URL, protectedRuntime)

  return {
    databasePoolMax: readDatabasePoolMax(env.DATABASE_POOL_MAX, environment),
    databaseURL: requireRuntimeValue('DATABASE_URL', env.DATABASE_URL, protectedRuntime),
    environment,
    externalImageHosts: readHostAllowlist(env.EXTERNAL_IMAGE_HOSTS),
    feedOutboundHosts: readHostAllowlist(env.FEED_OUTBOUND_HOSTS),
    leadRetentionDays: 365,
    localFullCatalog: env.LOCAL_FULL_CATALOG === 'true',
    payloadSecret: readPayloadSecret(env.PAYLOAD_SECRET, protectedRuntime),
    releaseSHA: env.RELEASE_SHA ?? 'local',
    revalidateSecret: readSecret('REVALIDATE_SECRET', env.REVALIDATE_SECRET, protectedRuntime),
    s3: readS3Config(env, environment === 'production'),
    secureCookies: protectedRuntime,
    siteEngine: env.SITE_ENGINE ?? 'payload',
    siteURL,
  }
}

export const runtimeConfig = buildRuntimeConfig(process.env)

export function resolveRuntimeReference(name: string) {
  if (!/^[A-Z][A-Z0-9_]{1,127}$/.test(name)) throw new Error('Invalid runtime environment reference')
  return process.env[name]
}

function resolveEnvironment(env: z.infer<typeof environmentSchema>): RuntimeEnvironment {
  if (env.NEXT_PHASE === 'phase-production-build') return 'development'
  return env.APP_ENV ?? (env.NODE_ENV === 'test' ? 'test' : env.NODE_ENV === 'production' ? 'production' : 'development')
}

function requireRuntimeValue(name: string, value: string | undefined, required: boolean) {
  if (required && !value) throw new Error('Missing required runtime environment variable: ' + name)
  return value ?? ''
}

function readPayloadSecret(value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error('Missing required runtime environment variable: PAYLOAD_SECRET')
    return ''
  }
  const normalized = value.trim().toLowerCase()
  if (required && knownSecretPlaceholders.some((placeholder) => normalized.includes(placeholder))) {
    throw new Error('PAYLOAD_SECRET uses a forbidden placeholder')
  }
  return required ? parseStrongSecret('PAYLOAD_SECRET', value) : value
}

function readSecret(name: string, value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error('Missing required runtime environment variable: ' + name)
    return ''
  }
  return required ? parseStrongSecret(name, value) : value
}

function parseStrongSecret(name: string, value: string) {
  if (value.length < 32) throw new Error(name + ' must contain at least 32 characters')
  if (/^(.)\1+$/.test(value)) throw new Error(name + ' must not repeat one character')
  return value
}

function readSiteURL(value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error('Missing required runtime environment variable: NEXT_PUBLIC_SITE_URL')
    return 'http://127.0.0.1:3000'
  }
  const parsed = z.url().parse(value)
  if (required && !parsed.startsWith('https://')) throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS')
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

function readHostAllowlist(value: string | undefined) {
  if (!value) return []
  return [...new Set(value.split(',').map((host) => hostnameSchema.parse(host.trim().toLowerCase())).filter(Boolean))]
}

function readS3Config(env: z.infer<typeof environmentSchema>, required: boolean): S3RuntimeConfig | null {
  const values = [env.S3_BUCKET, env.S3_ACCESS_KEY_ID, env.S3_SECRET_ACCESS_KEY, env.S3_REGION]
  const configuredCount = values.filter(Boolean).length
  if (configuredCount === 0) {
    if (required) throw new Error('Persistent S3 storage is required in staging and production')
    return null
  }
  if (configuredCount !== values.length) throw new Error('S3 configuration is incomplete')
  return {
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    bucket: env.S3_BUCKET!,
    endpoint: env.S3_ENDPOINT || undefined,
    forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
    region: env.S3_REGION!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
  }
}
