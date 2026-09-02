import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const value = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}
const root = resolve(value('--root', '.'))
const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')
const parsed = new URL(databaseURL)
const databaseName = parsed.pathname.replace(/^\//, '')
if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || !databaseName.endsWith('_starter_test')) {
  throw new Error(`Refusing baseline database: ${parsed.hostname}/${databaseName}. Expected localhost and *_starter_test`)
}
if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 16) throw new Error('A stable local PAYLOAD_SECRET with at least 16 characters is required')

const migrationDir = join(root, 'src', 'payload', 'migrations')
if (existsSync(migrationDir)) {
  const existing = readdirSync(migrationDir).filter((name) => name !== 'index.ts')
  if (existing.length) throw new Error(`Neutral baseline requires an empty migration directory, found: ${existing.join(', ')}`)
  const indexPath = join(migrationDir, 'index.ts')
  if (existsSync(indexPath) && !readFileSync(indexPath, 'utf8').includes('migrations = []')) {
    throw new Error('Neutral baseline migration index is not empty')
  }
}

run('pnpm', ['generate:types'])
run('pnpm', ['generate:importmap'])
run('pnpm', ['payload', 'migrate:create', 'neutral_initial'])
run('pnpm', ['payload', 'migrate'])
run('pnpm', ['payload', 'migrate'])

console.log(JSON.stringify({ root, database: databaseName, status: 'neutral-baseline-ready' }, null, 2))

function run(command, commandArgs) {
  const executable = process.platform === 'win32' ? 'cmd.exe' : command
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', command, ...commandArgs] : commandArgs
  const result = spawnSync(executable, args, {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: 'inherit',
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
