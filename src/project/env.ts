type EnvironmentSource = Readonly<Record<string, string | undefined>>

type S3RuntimeConfig = {
  accessKeyId: string
  bucket: string
  endpoint?: string
  forcePathStyle: boolean
  region: string
  secretAccessKey: string
}

type EmailRuntimeConfig = {
  fromAddress: string
  fromName: string
  host: string
  password: string
  port: number
  secure: boolean
  user: string
}

type RuntimeEnvironment = 'development' | 'local' | 'production' | 'staging' | 'test'

const knownSecretPlaceholders = [
  'change-me-foundation-secret',
  'foundation-test-secret-please-change',
  'test-foundation-secret',
  'visual-verification-secret-only',
  'changeme',
  'change-me',
  'payload-secret',
]

export function buildRuntimeConfig(env: EnvironmentSource) {
  const environment = resolveEnvironment(env)
  const persistentStorageRequired = !['development', 'local', 'test'].includes(environment)

  return {
    databaseURL: requireEnvironmentValue('DATABASE_URL', env.DATABASE_URL, environment),
    email: readEmailConfig(env, environment),
    externalImageHosts: readHostAllowlist(env.EXTERNAL_IMAGE_HOSTS),
    environment,
    leadRetentionDays: readRetentionDays(env.LEAD_RETENTION_DAYS, environment),
    payloadSecret: validatePayloadSecret(env.PAYLOAD_SECRET, environment),
    releaseSHA: env.RELEASE_SHA ?? 'local',
    s3: readS3Config(env, persistentStorageRequired),
  }
}

export const runtimeConfig = buildRuntimeConfig(process.env)
function resolveEnvironment(env: EnvironmentSource): RuntimeEnvironment {
  if (env.NEXT_PHASE === 'phase-production-build') return 'development'
  const value = env.APP_ENV ?? (env.NODE_ENV === 'test' ? 'test' : env.NODE_ENV === 'production' ? 'production' : 'development')
  if (!['development', 'local', 'production', 'staging', 'test'].includes(value)) {
    throw new Error(`Unsupported APP_ENV: ${value}`)
  }
  return value as RuntimeEnvironment
}

function requireEnvironmentValue(name: string, value: string | undefined, environment: RuntimeEnvironment) {
  if (['production', 'staging'].includes(environment) && !value) {
    throw new Error(`Missing required ${environment} environment variable: ${name}`)
  }
  return value ?? ''
}

function validatePayloadSecret(value: string | undefined, environment: RuntimeEnvironment) {
  if (!['production', 'staging'].includes(environment)) return value ?? ''
  if (!value) throw new Error(`Missing required ${environment} environment variable: PAYLOAD_SECRET`)

  const normalized = value.trim().toLowerCase()
  if (knownSecretPlaceholders.some((placeholder) => normalized === placeholder || normalized.includes(placeholder))) {
    throw new Error('PAYLOAD_SECRET uses a known placeholder and is forbidden outside development/test')
  }
  if (value.length < 32) throw new Error('PAYLOAD_SECRET must contain at least 32 characters outside development/test')
  if (/^(.)\1+$/.test(value)) throw new Error('PAYLOAD_SECRET must not repeat one character')
  return value
}

function readEmailConfig(env: EnvironmentSource, environment: RuntimeEnvironment): EmailRuntimeConfig | null {
  const values = [env.SMTP_HOST, env.SMTP_PORT, env.SMTP_USER, env.SMTP_PASSWORD, env.EMAIL_FROM_ADDRESS, env.EMAIL_FROM_NAME]
  const configuredCount = values.filter(Boolean).length
  if (configuredCount === 0) {
    if (['production', 'staging'].includes(environment)) {
      throw new Error(`Missing required ${environment} SMTP email configuration`)
    }
    return null
  }
  if (configuredCount !== values.length) throw new Error('SMTP email configuration is incomplete')

  const port = Number(env.SMTP_PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('SMTP_PORT must be an integer between 1 and 65535')
  return {
    fromAddress: env.EMAIL_FROM_ADDRESS!,
    fromName: env.EMAIL_FROM_NAME!,
    host: env.SMTP_HOST!,
    password: env.SMTP_PASSWORD!,
    port,
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER!,
  }
}

function readHostAllowlist(value: string | undefined) {
  if (!value) return []
  const hosts = value.split(',').map((host) => host.trim().toLowerCase()).filter(Boolean)
  for (const host of hosts) {
    if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(host)) {
      throw new Error(`Invalid hostname in EXTERNAL_IMAGE_HOSTS: ${host}`)
    }
  }
  return [...new Set(hosts)]
}

function readRetentionDays(value: string | undefined, environment: RuntimeEnvironment) {
  if (!value) {
    if (['production', 'staging'].includes(environment)) {
      throw new Error(`Missing required ${environment} environment variable: LEAD_RETENTION_DAYS`)
    }
    return null
  }

  const days = Number(value)
  if (!Number.isInteger(days) || days < 30 || days > 3_650) {
    throw new Error('LEAD_RETENTION_DAYS must be an integer between 30 and 3650')
  }
  return days
}

function readS3Config(env: EnvironmentSource, required: boolean): S3RuntimeConfig | null {
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
