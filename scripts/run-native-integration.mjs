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
const testDatabase = 'soyuz_rostov_test'
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
const command = process.argv.includes('--migrate')
  ? 'pnpm payload migrate'
  : process.argv.includes('--e2e-production')
    ? 'pnpm payload migrate && pnpm test:e2e:production'
    : process.argv.includes('--e2e')
      ? 'pnpm test:e2e'
      : 'pnpm test:int'
const result = spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
  env: {
    ...process.env,
    DATABASE_URL: testURL.toString(),
    NODE_ENV: 'test',
  },
  stdio: 'inherit',
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
