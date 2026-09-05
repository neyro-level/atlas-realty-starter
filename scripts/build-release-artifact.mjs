import { createHash } from 'node:crypto'
import {
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
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

function materializeSymlinks(root) {
  if (!existsSync(root)) return
  for (const entry of readdirSync(root)) {
    const entryPath = path.join(root, entry)
    const info = lstatSync(entryPath)
    if (info.isSymbolicLink()) {
      const target = realpathSync(entryPath)
      const targetInfo = statSync(target)
      rmSync(entryPath, { force: true, recursive: targetInfo.isDirectory() })
      if (targetInfo.isDirectory()) {
        cpSync(target, entryPath, { dereference: true, recursive: true })
        materializeSymlinks(entryPath)
      } else {
        copyFileSync(target, entryPath)
      }
    } else if (info.isDirectory()) {
      materializeSymlinks(entryPath)
    }
  }
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
const archivePath = path.join(outputDir, 'release.tar.gz')
const manifestPath = path.join(outputDir, 'release.json')
const partBytes = 40 * 1024 * 1024
const maxParts = 10
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

mkdirSync(outputDir, { recursive: true })
rmSync(bundleDir, { force: true, recursive: true })
rmSync(archivePath, { force: true })
for (let index = 0; index < maxParts; index += 1) {
  rmSync(path.join(outputDir, `release.part${String(index).padStart(2, '0')}`), { force: true })
}

try {
  run(pnpm, ['--filter', '.', 'deploy', '--prod', '--legacy', bundleDir])
  copyFileSync(path.join(standaloneRoot, 'server.js'), path.join(bundleDir, 'server.js'))
  rmSync(path.join(bundleDir, '.next'), { force: true, recursive: true })
  cpSync(path.join(standaloneRoot, '.next'), path.join(bundleDir, '.next'), {
    dereference: true,
    recursive: true,
  })
  materializeSymlinks(path.join(bundleDir, '.next', 'node_modules'))

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

const archive = readFileSync(archivePath)
const checksum = createHash('sha256').update(archive).digest('hex')
const partCount = Math.ceil(archive.length / partBytes)
if (partCount > maxParts) throw new Error(`Release archive requires ${partCount} parts; maximum is ${maxParts}.`)
const parts = []
for (let index = 0; index < maxParts; index += 1) {
  const name = `release.part${String(index).padStart(2, '0')}`
  const content = index < partCount ? archive.subarray(index * partBytes, (index + 1) * partBytes) : Buffer.alloc(0)
  writeFileSync(path.join(outputDir, name), content)
  if (content.length) parts.push({ name, sha256: createHash('sha256').update(content).digest('hex'), size: content.length })
}
rmSync(archivePath, { force: true })
const manifest = {
  archive: path.basename(archivePath),
  archiveBytes: archive.length,
  buildBeforeDeploy: true,
  createdAt: new Date().toISOString(),
  node: '24.20.0',
  pnpm: '11.24.0',
  repository: canonicalRepository(),
  sha,
  sha256: checksum,
  parts,
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write(`${manifestPath}\n`)
