import { spawnSync } from 'node:child_process'

import dotenv from 'dotenv'
import pg from 'pg'

const hasInjectedIntegrationEnvironment = Boolean(process.env.DATABASE_URL)
dotenv.config({ path: '.env' })
dotenv.config({ override: !hasInjectedIntegrationEnvironment, path: '.env.local' })

const appDatabaseURL = process.env.DATABASE_URL
if (!appDatabaseURL) throw new Error('Native integration tests require DATABASE_URL')

const appURL = new URL(appDatabaseURL)
const appUser = decodeURIComponent(appURL.username)
const testDatabase = 'ams_realty_platform_starter_test'
if (!/^[a-z_][a-z0-9_]*$/.test(appUser) || !/^[a-z_][a-z0-9_]*$/.test(testDatabase)) {
  throw new Error('Unsafe native integration database identifier')
}

const testURL = new URL(appDatabaseURL)
testURL.pathname = `/${testDatabase}`
const testDatabaseClient = new pg.Client({ connectionString: testURL.toString() })
await testDatabaseClient.connect()
try {
  await testDatabaseClient.query('DROP SCHEMA IF EXISTS public CASCADE')
  await testDatabaseClient.query(`CREATE SCHEMA public AUTHORIZATION "${appUser}"`)
} finally {
  await testDatabaseClient.end()
}
const childEnvironment = {
  ...process.env,
  DATABASE_URL: testURL.toString(),
  NODE_ENV: 'test',
}
if (process.argv.includes('--production-migrate')) {
  Object.assign(childEnvironment, {
    APP_ENV: 'production',
    PAYLOAD_SECRET: 'production-migration-check-secret-32-characters',
    NEXT_PUBLIC_SITE_URL: 'https://example.test',
    S3_ACCESS_KEY_ID: 'migration-check',
    S3_BUCKET: 'migration-check',
    REVALIDATE_SECRET: 'production-revalidate-check-secret-32-characters',
    S3_ENDPOINT: 'https://s3.invalid',
    S3_REGION: 'ru-1',
    S3_SECRET_ACCESS_KEY: 'migration-check',
  })
}
if (process.argv.includes('--e2e-production')) {
  childEnvironment.APP_RUNTIME = 'production'
}

function run(command) {
  const result = spawnSync('cmd.exe', ['/d', '/s', '/c', command], { env: childEnvironment, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

if (process.argv.includes('--roles-check')) {
  run('pnpm payload migrate')

  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    await fixture.query(
      'UPDATE "payload_migrations" SET "batch" = CASE ' +
      "WHEN \"name\" = '20260903_130533' THEN 1 " +
      "WHEN \"name\" = '20260904_090000_standard_21_roles' THEN 2 " +
      'ELSE "batch" END',
    )
  } finally {
    await fixture.end()
  }

  run('pnpm payload migrate:down')

  const legacyFixture = new pg.Client({ connectionString: testURL.toString() })
  await legacyFixture.connect()
  try {
    await legacyFixture.query(
      'INSERT INTO "users" ("name", "email", "username", "role", "updated_at", "created_at") VALUES ' +
      "('Existing super admin', 'admin@example.test', 'legacy-admin', 'SUPER_ADMIN', now(), now())," +
      "('Existing director', 'director@example.test', 'legacy-director', 'DIRECTOR', now(), now())," +
      "('Existing content manager', 'editor@example.test', 'legacy-editor', 'CONTENT_MANAGER', now(), now())",
    )
  } finally {
    await legacyFixture.end()
  }

  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const result = await verification.query('SELECT "role", count(*)::int AS "count" FROM "users" GROUP BY "role"')
    const counts = new Map(result.rows.map((row) => [row.role, row.count]))
    if (counts.get('owner') !== 1 || counts.get('editor') !== 2) {
      throw new Error('Role migration did not map SUPER_ADMIN to owner and other roles to editor')
    }
  } finally {
    await verification.end()
  }
  console.log(JSON.stringify({ existingUsersPreserved: 3, roleMigration: 'PASS' }))
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
