import { spawnSync } from 'node:child_process'

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env' })
dotenv.config({ override: true, path: '.env.local' })

const appDatabaseURL = process.env.DATABASE_URL
const superuserPassword = process.env.LOCAL_POSTGRES_SUPERUSER_PASSWORD
if (!appDatabaseURL || !superuserPassword) {
  throw new Error('Native integration tests require DATABASE_URL and LOCAL_POSTGRES_SUPERUSER_PASSWORD')
}

const appURL = new URL(appDatabaseURL)
const appUser = decodeURIComponent(appURL.username)
const testDatabase = 'ams_realty_platform_starter_test'
if (!/^[a-z_][a-z0-9_]*$/.test(appUser) || !/^[a-z_][a-z0-9_]*$/.test(testDatabase)) {
  throw new Error('Unsafe native integration database identifier')
}

const adminURL = new URL(appDatabaseURL)
adminURL.username = 'postgres'
adminURL.password = superuserPassword
adminURL.pathname = '/postgres'
const admin = new pg.Client({ connectionString: adminURL.toString() })
await admin.connect()
try {
  await admin.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()', [testDatabase])
  await admin.query(`DROP DATABASE IF EXISTS "${testDatabase}"`)
  await admin.query(`CREATE DATABASE "${testDatabase}" OWNER "${appUser}"`)
} finally {
  await admin.end()
}

const testURL = new URL(appDatabaseURL)
testURL.pathname = `/${testDatabase}`
const childEnvironment = {
  ...process.env,
  DATABASE_URL: testURL.toString(),
  NODE_ENV: 'test',
}
if (process.argv.includes('--production-migrate')) {
  Object.assign(childEnvironment, {
    APP_ENV: 'production',
    PAYLOAD_DIRECTOR_PASSWORD: 'director-secret',
    PAYLOAD_DIRECTOR_USERNAME: 'director',
    PAYLOAD_SECRET: 'production-migration-check-secret-32-characters',
    HEALTH_SECRET: 'production-health-check-secret-32-characters',
    NEXT_PUBLIC_SITE_URL: 'https://example.test',
    PAYLOAD_SUPERADMIN_PASSWORD: 'superadmin-secret',
    PAYLOAD_SUPERADMIN_USERNAME: 'superadmin',
    S3_ACCESS_KEY_ID: 'migration-check',
    S3_BUCKET: 'migration-check',
    PRIVACY_HMAC_SECRET: 'production-privacy-check-secret-32-characters',
    REVALIDATE_SECRET: 'production-revalidate-check-secret-32-characters',
    S3_ENDPOINT: 'https://s3.invalid',
    S3_REGION: 'ru-1',
    S3_SECRET_ACCESS_KEY: 'migration-check',
  })
}

function run(command) {
  const result = spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
    env: childEnvironment,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

if (process.argv.includes('--upgrade-auth')) {
  run('pnpm payload migrate')
  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    await fixture.query(
      `UPDATE "payload_migrations" SET "batch" = 2
       WHERE "name" = '20260903_050009_username_auth'`,
    )
  } finally {
    await fixture.end()
  }
  run('pnpm payload migrate:down')
  const existingFixture = new pg.Client({ connectionString: testURL.toString() })
  await existingFixture.connect()
  try {
    await existingFixture.query(
      `INSERT INTO "users" ("name", "email", "role", "updated_at", "created_at")
       VALUES ('Existing super admin', 'admin@example.test', 'SUPER_ADMIN', now(), now()),
              ('Existing director', 'director@example.test', 'DIRECTOR', now(), now())`,
    )
  } finally {
    await existingFixture.end()
  }
  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const result = await verification.query('SELECT "role", "username" FROM "users" ORDER BY "role"')
    const usernames = new Map(result.rows.map((row) => [row.role, row.username]))
    if (usernames.get('SUPER_ADMIN') !== 'superadmin' || usernames.get('DIRECTOR') !== 'director') {
      throw new Error('Username migration did not preserve and label existing privileged users')
    }
  } finally {
    await verification.end()
  }
  console.log(JSON.stringify({ existingUsersPreserved: 2, usernameMigration: 'PASS' }))
  process.exit(0)
}

const command = process.argv.includes('--migrate') || process.argv.includes('--production-migrate')
  ? 'pnpm payload migrate'
  : process.argv.includes('--e2e-production')
    ? 'pnpm payload migrate && pnpm test:e2e:production:raw'
    : process.argv.includes('--e2e')
      ? 'pnpm payload migrate && pnpm test:e2e:raw'
      : 'pnpm payload migrate && pnpm test:int:raw'
run(command)
