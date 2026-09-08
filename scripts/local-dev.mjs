import { randomBytes } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import pg from 'pg'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localDir = path.join(root, '.local-dev')
const envPath = path.join(root, '.env.local')
const runtimeEnvPath = path.join(localDir, 'runtime.env')
const pidPath = path.join(localDir, 'app.pid')
const stdoutPath = path.join(localDir, 'server.log')
const stderrPath = path.join(localDir, 'server.error.log')
const siteUrl = 'http://127.0.0.1:3000'
const expected = { properties: 60, complexes: 20 }
const minimumMedia = expected.properties + expected.complexes

function fail(message) {
  console.error(`Ошибка: ${message}`)
  process.exitCode = 1
}

function readProjectEnv() {
  if (!fs.existsSync(envPath)) {
    throw new Error('нет .env.local. Скопируйте .env.example и задайте безопасный DATABASE_URL.')
  }
  const parsed = dotenv.parse(fs.readFileSync(envPath))
  if (!parsed.DATABASE_URL) {
    throw new Error('в .env.local не задан DATABASE_URL.')
  }
  return parsed
}

function safeDatabaseTarget(connectionString) {
  const url = new URL(connectionString)
  const database = decodeURIComponent(url.pathname.slice(1))
  const host = url.hostname
  const port = url.port || '5432'
  if (!['127.0.0.1', 'localhost'].includes(host)) {
    throw new Error(`DATABASE_URL должен вести на локальный PostgreSQL, получен host ${host}.`)
  }
  if (!/_(dev|test|staging)$/.test(database)) {
    throw new Error(
      `имя локальной базы должно оканчиваться на _dev, _test или _staging, получено ${database}.`,
    )
  }
  return { database, host, port }
}

function expectedMigrationNames() {
  const directory = path.join(root, 'src', 'payload', 'migrations-v2')
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith('.ts') && name !== 'index.ts')
    .map((name) => name.slice(0, -3))
    .sort()
}

async function inspectDatabase(projectEnv) {
  const target = safeDatabaseTarget(projectEnv.DATABASE_URL)
  const client = new pg.Client({ connectionString: projectEnv.DATABASE_URL })
  await client.connect()
  try {
    const versionResult = await client.query('show server_version')
    const propertiesResult = await client.query(
      'select count(*)::int as count from properties where is_published = true',
    )
    const complexesResult = await client.query(
      "select count(*)::int as count from residential_complexes where status = 'published'",
    )
    const mediaResult = await client.query('select count(*)::int as count from media')
    const migrationsResult = await client.query('select name from payload_migrations order by name')
    const version = versionResult.rows[0].server_version
    if (Number.parseInt(version, 10) !== 18) {
      throw new Error(`нужен PostgreSQL 18, найден ${version}.`)
    }
    const counts = {
      properties: propertiesResult.rows[0].count,
      complexes: complexesResult.rows[0].count,
      media: mediaResult.rows[0].count,
    }
    const actualMigrations = migrationsResult.rows.map(({ name }) => name).sort()
    const committedMigrations = expectedMigrationNames()
    if (JSON.stringify(actualMigrations) !== JSON.stringify(committedMigrations)) {
      throw new Error(
        'миграции базы не совпадают с проектом. Выполните `pnpm payload migrate`, затем повторите запуск.',
      )
    }
    return { counts, target, version }
  } finally {
    await client.end()
  }
}

function countMediaFiles() {
  const mediaDir = path.join(root, 'media')
  if (!fs.existsSync(mediaDir)) return 0
  return fs
    .readdirSync(mediaDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile()).length
}

function assertDemoData(database) {
  for (const [key, value] of Object.entries(expected)) {
    if (database.counts[key] !== value) {
      throw new Error(`демоданные неполные: ${key} = ${database.counts[key]}, ожидается ${value}.`)
    }
  }
  if (database.counts.media < minimumMedia) {
    throw new Error(
      `демоданные неполные: media = ${database.counts.media}, ожидается не меньше ${minimumMedia}.`,
    )
  }
  const mediaFiles = countMediaFiles()
  if (mediaFiles !== database.counts.media) {
    throw new Error(
      `локальные медиафайлы = ${mediaFiles}, записей media в базе = ${database.counts.media}.`,
    )
  }
  return mediaFiles
}

async function probe(url, timeout = 5_000) {
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(timeout) })
    return response.status
  } catch {
    return null
  }
}

async function probeTotal(pathname, timeout = 10_000) {
  try {
    const response = await fetch(`${siteUrl}${pathname}`, {
      signal: AbortSignal.timeout(timeout),
    })
    if (!response.ok) return { status: response.status, total: null }
    const body = await response.json()
    return { status: response.status, total: body?.data?.totalDocs ?? null }
  } catch {
    return { status: null, total: null }
  }
}

async function inspectSite(homeTimeout = 10_000) {
  const health = await probe(`${siteUrl}/healthz`)
  const home = health === 200 ? await probe(`${siteUrl}/`, homeTimeout) : null
  const [properties, complexes] =
    home === 200
      ? await Promise.all([
          probeTotal('/api/public/v1/catalog?limit=1'),
          probeTotal('/api/public/v1/complexes?limit=1'),
        ])
      : [
          { status: null, total: null },
          { status: null, total: null },
        ]
  return {
    complexes,
    health,
    home,
    properties,
    ready:
      health === 200 &&
      home === 200 &&
      properties.status === 200 &&
      properties.total === expected.properties &&
      complexes.status === 200 &&
      complexes.total === expected.complexes,
  }
}

function gitIdentity() {
  const branch = spawnSync('git', ['branch', '--show-current'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  })
  const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  })
  return `${branch.stdout.trim() || 'detached'} @ ${sha.stdout.trim() || 'unknown'}`
}

function readManagedPid() {
  if (!fs.existsSync(pidPath)) return null
  const pid = Number.parseInt(fs.readFileSync(pidPath, 'utf8').trim(), 10)
  return Number.isSafeInteger(pid) && pid > 0 ? pid : null
}

function processExists(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function ensureRuntimeEnv() {
  fs.mkdirSync(localDir, { recursive: true })
  if (!fs.existsSync(runtimeEnvPath)) {
    const content = [
      `PAYLOAD_SECRET=${randomBytes(32).toString('hex')}`,
      `REVALIDATE_SECRET=${randomBytes(32).toString('hex')}`,
      '',
    ].join('\n')
    fs.writeFileSync(runtimeEnvPath, content, { encoding: 'utf8', flag: 'wx' })
  }
  return dotenv.parse(fs.readFileSync(runtimeEnvPath))
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen(port, '127.0.0.1')
  })
}

function startNext(projectEnv) {
  const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!fs.existsSync(nextBin)) {
    throw new Error('зависимости не установлены. Выполните `pnpm install --frozen-lockfile`.')
  }
  const runtimeEnv = ensureRuntimeEnv()
  const out = fs.openSync(stdoutPath, 'w')
  const err = fs.openSync(stderrPath, 'w')
  const child = spawn(process.execPath, [nextBin, 'dev'], {
    cwd: root,
    detached: true,
    env: {
      ...process.env,
      ...projectEnv,
      ...runtimeEnv,
      APP_ENV: 'local',
      NEXT_PUBLIC_APP_ENV: 'development',
      NEXT_PUBLIC_INDEXABLE: 'false',
      NEXT_PUBLIC_SITE_URL: siteUrl,
      NODE_OPTIONS: '--no-deprecation',
      SITE_ENGINE: 'payload',
    },
    stdio: ['ignore', out, err],
    windowsHide: true,
  })
  fs.closeSync(out)
  fs.closeSync(err)
  child.unref()
  fs.writeFileSync(pidPath, `${child.pid}\n`, 'utf8')
  return child.pid
}

async function waitUntilReady(pid) {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now()
    const site = await inspectSite(Math.max(1_000, Math.min(45_000, remaining)))
    if (site.ready) return site
    if (!processExists(pid)) break
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`сайт не поднялся за 60 секунд. Логи: ${stdoutPath} и ${stderrPath}.`)
}

function openSite() {
  const child = spawn('cmd.exe', ['/c', 'start', '', siteUrl], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
}

async function printStatus() {
  console.log(`Проект: ${gitIdentity()}`)
  let projectEnv
  try {
    projectEnv = readProjectEnv()
    const database = await inspectDatabase(projectEnv)
    const files = countMediaFiles()
    console.log(
      `База: ${database.target.host}:${database.target.port}/${database.target.database}, PostgreSQL ${database.version}`,
    )
    console.log(
      `Данные: объекты ${database.counts.properties}/60, ЖК ${database.counts.complexes}/20, медиа ${database.counts.media}, файлов ${files}`,
    )
  } catch (error) {
    console.log(`База: недоступна (${error.message})`)
  }
  const site = await inspectSite()
  const pid = readManagedPid()
  const managed = pid && processExists(pid) ? `, PID ${pid}` : ''
  console.log(
    site.ready
      ? `Сайт: готов — ${siteUrl}${managed}`
      : `Сайт: не готов (health ${site.health ?? 'нет ответа'}, главная ${site.home ?? 'нет ответа'}, API ${site.properties.total ?? '?'}/60 и ${site.complexes.total ?? '?'}/20)${managed}`,
  )
}

async function start() {
  const startedAt = Date.now()
  const projectEnv = readProjectEnv()
  const database = await inspectDatabase(projectEnv)
  const mediaFiles = assertDemoData(database)

  const current = await inspectSite()
  if (current.ready) {
    console.log(`Готово за ${((Date.now() - startedAt) / 1000).toFixed(1)} с: ${siteUrl}`)
    console.log(
      `Данные: 60 объектов (30 квартир, 10 домов, 10 участков, 10 коммерческих), 20 ЖК, ${mediaFiles} медиа. Уже работающий процесс переиспользован.`,
    )
    if (process.argv.includes('--open')) openSite()
    return
  }
  if (!(await isPortAvailable(3000))) {
    throw new Error('порт 3000 занят другим процессом, но Atlas на нём не отвечает корректно.')
  }
  const pid = startNext(projectEnv)
  await waitUntilReady(pid)
  console.log(`Готово за ${((Date.now() - startedAt) / 1000).toFixed(1)} с: ${siteUrl}`)
  console.log(
    `Данные: 60 объектов (30 квартир, 10 домов, 10 участков, 10 коммерческих), 20 ЖК, ${mediaFiles} медиа. Управляемый PID ${pid}.`,
  )
  if (process.argv.includes('--open')) openSite()
}

function commandLineForPid(pid) {
  const script =
    '$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new(); ' +
    `(Get-CimInstance Win32_Process -Filter \"ProcessId = ${pid}\").CommandLine`
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', script], {
    encoding: 'utf8',
    windowsHide: true,
  })
  return result.stdout.trim()
}

async function stop() {
  const pid = readManagedPid()
  if (!pid || !processExists(pid)) {
    fs.rmSync(pidPath, { force: true })
    const site = await inspectSite()
    console.log(
      site.ready
        ? 'Сайт работает, но запущен не этим локальным пультом — процесс не остановлен.'
        : 'Сайт уже остановлен.',
    )
    return
  }
  const commandLine = commandLineForPid(pid)
  const normalizedCommand = commandLine.toLowerCase()
  if (!normalizedCommand.includes('node_modules\\next\\dist\\bin\\next')) {
    throw new Error(`PID ${pid} больше не похож на процесс Atlas; остановка отменена.`)
  }
  const result = spawnSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.status !== 0 && processExists(pid)) {
    throw new Error(`не удалось остановить PID ${pid}.`)
  }
  fs.rmSync(pidPath, { force: true })
  console.log('Локальный Atlas остановлен. PostgreSQL не затронут.')
}

const command = process.argv[2] || 'status'
try {
  if (command === 'start') await start()
  else if (command === 'status') await printStatus()
  else if (command === 'stop') await stop()
  else throw new Error('доступны команды: start, status, stop.')
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
