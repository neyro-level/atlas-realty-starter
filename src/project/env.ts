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
    bootstrapUsers: readBootstrapUsers(env, environment),
    databasePoolMax: readDatabasePoolMax(env.DATABASE_POOL_MAX, environment),
    databaseURL: requireEnvironmentValue('DATABASE_URL', env.DATABASE_URL, environment),
    externalImageHosts: readHostAllowlist(env.EXTERNAL_IMAGE_HOSTS),
    environment,
    leadRetentionDays: 365,
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


function readDatabasePoolMax(value: string | undefined, environment: RuntimeEnvironment) {
  if (!value) return environment === 'production' || environment === 'staging' ? 2 : 10
  const maximum = Number(value)
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 20) {
    throw new Error('DATABASE_POOL_MAX must be an integer between 1 and 20')
  }
  return maximum
}

function readBootstrapUsers(
  env: EnvironmentSource,
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
    if (!/^[a-z][a-z0-9._-]{2,63}$/i.test(user.username)) {
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
  const hosts = value.split(',').map((host) => host.trim().toLowerCase()).filter(Boolean)
  for (const host of hosts) {
    if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(host)) {
      throw new Error(`Invalid hostname in EXTERNAL_IMAGE_HOSTS: ${host}`)
    }
  }
  return [...new Set(hosts)]
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
