import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local', override: false })
dotenv.config({ path: '.env' })

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')
const source = new URL(databaseURL)
const database = source.pathname.replace(/^\//, '')
if (!['127.0.0.1', 'localhost'].includes(source.hostname) || !/_(dev|test|stg|staging)$/.test(database)) {
  throw new Error(`Refusing backup/restore verification for ${source.hostname}/${database}`)
}

const explicitRestoreURL = process.env.RESTORE_DATABASE_URL ? new URL(process.env.RESTORE_DATABASE_URL) : null
const expectedRestoreDatabase = `${database}_restore_check`
if (explicitRestoreURL) {
  const restoreName = explicitRestoreURL.pathname.replace(/^\//, '')
  if (!['127.0.0.1', 'localhost'].includes(explicitRestoreURL.hostname) || restoreName !== expectedRestoreDatabase) {
    throw new Error(`Refusing explicit restore target ${explicitRestoreURL.hostname}/${restoreName}`)
  }
}

const adminPassword = process.env.LOCAL_POSTGRES_SUPERUSER_PASSWORD || decodeURIComponent(source.password)
const adminUser = process.env.LOCAL_POSTGRES_SUPERUSER || 'postgres'
const port = source.port || '5432'
const restoreDatabase = explicitRestoreURL?.pathname.replace(/^\//, '') ?? expectedRestoreDatabase
const restoreHost = explicitRestoreURL?.hostname ?? source.hostname
const restorePort = explicitRestoreURL?.port || port
const restoreUser = explicitRestoreURL ? decodeURIComponent(explicitRestoreURL.username) : adminUser
const restorePassword = explicitRestoreURL ? decodeURIComponent(explicitRestoreURL.password) : adminPassword
const dumpPath = join(tmpdir(), `${database}-restore-check.dump`)
const binRoot = process.platform === 'win32' ? 'C:\\Program Files\\PostgreSQL\\18\\bin' : ''
const executable = (name) => process.platform === 'win32' ? join(binRoot, `${name}.exe`) : name

try {
  run('pg_dump', ['-h', source.hostname, '-p', port, '-U', decodeURIComponent(source.username), '-d', database, '-Fc', '-f', dumpPath], decodeURIComponent(source.password))
  if (!explicitRestoreURL) {
    run('dropdb', ['-h', restoreHost, '-p', restorePort, '-U', adminUser, '--if-exists', restoreDatabase], adminPassword)
    run('createdb', ['-h', restoreHost, '-p', restorePort, '-U', adminUser, '-O', decodeURIComponent(source.username), restoreDatabase], adminPassword)
  }
  run('pg_restore', ['-h', restoreHost, '-p', restorePort, '-U', restoreUser, '-d', restoreDatabase, '--exit-on-error', '--no-owner', '--no-privileges', dumpPath], restorePassword)
  const migrationCount = run('psql', ['-h', restoreHost, '-p', restorePort, '-U', restoreUser, '-d', restoreDatabase, '-Atc', 'SELECT COUNT(*) FROM payload_migrations'], restorePassword).trim()
  const sourceMigrationCount = run('psql', ['-h', source.hostname, '-p', port, '-U', decodeURIComponent(source.username), '-d', database, '-Atc', 'SELECT COUNT(*) FROM payload_migrations'], decodeURIComponent(source.password)).trim()
  if (!/^\d+$/.test(migrationCount) || Number(migrationCount) < 1) throw new Error(`Invalid migration count: ${migrationCount}`)
  if (migrationCount !== sourceMigrationCount) throw new Error(`Migration count mismatch: source=${sourceMigrationCount} restore=${migrationCount}`)
  process.stdout.write(`backup_restore_ok migrations=${migrationCount}\n`)
} finally {
  if (!explicitRestoreURL) {
    run('dropdb', ['-h', restoreHost, '-p', restorePort, '-U', adminUser, '--if-exists', restoreDatabase], adminPassword, true)
  }
  if (existsSync(dumpPath)) rmSync(dumpPath, { force: true })
}

function run(name, args, password, ignoreFailure = false) {
  const command = executable(name)
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: password },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0 && !ignoreFailure) {
    throw new Error(result.stderr || `${name} failed with status ${result.status}`)
  }
  return result.stdout || ''
}
