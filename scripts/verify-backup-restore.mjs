import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local', override: false })
dotenv.config({ path: '.env', override: true })

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')
const source = new URL(databaseURL)
const database = source.pathname.replace(/^\//, '')
if (!['127.0.0.1', 'localhost'].includes(source.hostname) || !/_(dev|test|staging)$/.test(database)) {
  throw new Error(`Refusing backup/restore verification for ${source.hostname}/${database}`)
}

const adminPassword = process.env.LOCAL_POSTGRES_SUPERUSER_PASSWORD || decodeURIComponent(source.password)
const adminUser = process.env.LOCAL_POSTGRES_SUPERUSER || 'postgres'
const port = source.port || '5432'
const restoreDatabase = `${database}_restore_check`
const dumpPath = join(tmpdir(), `${database}-restore-check.dump`)
const binRoot = process.platform === 'win32' ? 'C:\\Program Files\\PostgreSQL\\18\\bin' : ''
const executable = (name) => process.platform === 'win32' ? join(binRoot, `${name}.exe`) : name

try {
  run('pg_dump', ['-h', source.hostname, '-p', port, '-U', decodeURIComponent(source.username), '-d', database, '-Fc', '-f', dumpPath], decodeURIComponent(source.password))
  run('dropdb', ['-h', source.hostname, '-p', port, '-U', adminUser, '--if-exists', restoreDatabase], adminPassword)
  run('createdb', ['-h', source.hostname, '-p', port, '-U', adminUser, '-O', decodeURIComponent(source.username), restoreDatabase], adminPassword)
  run('pg_restore', ['-h', source.hostname, '-p', port, '-U', adminUser, '-d', restoreDatabase, '--no-owner', '--role', decodeURIComponent(source.username), dumpPath], adminPassword)
  const migrationCount = run('psql', ['-h', source.hostname, '-p', port, '-U', decodeURIComponent(source.username), '-d', restoreDatabase, '-Atc', 'SELECT COUNT(*) FROM payload_migrations'], decodeURIComponent(source.password)).trim()
  if (!/^\d+$/.test(migrationCount) || Number(migrationCount) < 1) throw new Error(`Invalid migration count: ${migrationCount}`)
  process.stdout.write(`backup_restore_ok migrations=${migrationCount}\n`)
} finally {
  run('dropdb', ['-h', source.hostname, '-p', port, '-U', adminUser, '--if-exists', restoreDatabase], adminPassword, true)
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
