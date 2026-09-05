import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const projectRoot = process.cwd()

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: 'utf8',
    env: process.env,
    stdio: options.capture ? 'pipe' : 'inherit',
  })
  if (result.error || result.status !== 0) {
    if (options.capture && result.stderr) process.stderr.write(result.stderr)
    throw result.error ?? new Error(`${command} ${args.join(' ')} failed`)
  }
  return options.capture ? result.stdout.trim() : ''
}

function git(args) {
  return run('git', args, { capture: true })
}

function canonicalRepository() {
  const remote = git(['remote', 'get-url', 'origin'])
  const match = remote.match(/(?:sourcecraft\.dev[/:])([^/]+\/[^/.]+)(?:\.git)?$/u)
  if (!match) throw new Error('origin must be a SourceCraft repository.')
  return match[1]
}

if (process.platform !== 'linux') {
  throw new Error('Production artifacts must be assembled by the Linux SourceCraft pipeline.')
}

const branch = git(['branch', '--show-current'])
const sha = git(['rev-parse', 'HEAD'])
const trackedDiff = spawnSync('git', ['diff', '--quiet', 'HEAD', '--'], {
  cwd: projectRoot,
  stdio: 'ignore',
})
const untracked = git(['ls-files', '--others', '--exclude-standard'])
const isCI = process.env.CI === 'true' || process.env.CI === '1'

if (trackedDiff.error || trackedDiff.status !== 0 || untracked || (branch && branch !== 'main')) {
  throw new Error('Release artifact requires clean exact origin/main.')
}

if (!isCI) {
  const originMain = git(['rev-parse', '--verify', 'refs/remotes/origin/main'])
  if (sha !== originMain || branch !== 'main') {
    throw new Error('Release artifact requires clean exact origin/main.')
  }
}

const standaloneRoot = path.join(projectRoot, '.next', 'standalone')
if (!existsSync(path.join(standaloneRoot, 'server.js'))) {
  throw new Error('Missing .next/standalone/server.js. Run pnpm build first.')
}

const outputDir = path.join(projectRoot, '.release-artifacts')
const bundleDir = path.join(outputDir, `.bundle-${sha}`)
const archivePath = path.join(outputDir, `ams-realty-platform-starter-${sha}.tar.gz`)
const manifestPath = path.join(outputDir, `ams-realty-platform-starter-${sha}.json`)
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

mkdirSync(outputDir, { recursive: true })
rmSync(bundleDir, { force: true, recursive: true })
rmSync(archivePath, { force: true })

try {
  run(pnpm, ['--filter', '.', 'deploy', '--prod', '--legacy', bundleDir])
  cpSync(standaloneRoot, bundleDir, { dereference: false, recursive: true })

  const staticRoot = path.join(projectRoot, '.next', 'static')
  if (existsSync(staticRoot)) {
    cpSync(staticRoot, path.join(bundleDir, '.next', 'static'), { recursive: true })
  }
  const publicRoot = path.join(projectRoot, 'public')
  if (existsSync(publicRoot)) {
    cpSync(publicRoot, path.join(bundleDir, 'public'), { recursive: true })
  }

  for (const forbidden of ['.env', '.env.local', '.git']) {
    if (existsSync(path.join(bundleDir, forbidden))) {
      throw new Error(`Forbidden release entry: ${forbidden}`)
    }
  }

  writeFileSync(
    path.join(bundleDir, '.release.json'),
    `${JSON.stringify({ builtAt: new Date().toISOString(), sha }, null, 2)}\n`,
  )
  run('tar', ['-czf', archivePath, '-C', bundleDir, '.'])
} finally {
  rmSync(bundleDir, { force: true, recursive: true })
}

const checksum = createHash('sha256').update(readFileSync(archivePath)).digest('hex')
const manifest = {
  archive: path.basename(archivePath),
  buildBeforeDeploy: true,
  createdAt: new Date().toISOString(),
  node: '24.20.0',
  pnpm: '11.24.0',
  repository: canonicalRepository(),
  sha,
  sha256: checksum,
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write(`${manifestPath}\n`)
