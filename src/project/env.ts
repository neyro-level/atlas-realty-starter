type S3RuntimeConfig = {
  accessKeyId: string
  bucket: string
  endpoint?: string
  forcePathStyle: boolean
  region: string
  secretAccessKey: string
}

function requireProductionValue(name: string, value: string | undefined) {
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error(`Missing required production environment variable: ${name}`)
  }

  return value ?? ''
}

function readS3Config(): S3RuntimeConfig | null {
  const bucket = process.env.S3_BUCKET
  const configuredValues = [
    bucket,
    process.env.S3_ACCESS_KEY_ID,
    process.env.S3_SECRET_ACCESS_KEY,
    process.env.S3_REGION,
  ]
  const configuredCount = configuredValues.filter(Boolean).length

  if (configuredCount === 0) {
    return null
  }

  if (configuredCount !== configuredValues.length) {
    throw new Error('S3 configuration is incomplete. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_REGION together.')
  }

  return {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    bucket: bucket ?? '',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    region: process.env.S3_REGION ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  }
}

export const runtimeConfig = {
  databaseURL: requireProductionValue('DATABASE_URL', process.env.DATABASE_URL),
  payloadSecret: requireProductionValue('PAYLOAD_SECRET', process.env.PAYLOAD_SECRET),
  releaseSHA: process.env.RELEASE_SHA ?? 'local',
  s3: readS3Config(),
}
