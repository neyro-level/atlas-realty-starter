import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

function runGit(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `git ${args.join(' ')} failed\n`)
    process.exit(result.status ?? 1)
  }
  return result.stdout.trim()
}

const branch = runGit(['branch', '--show-current'])
const sha = runGit(['rev-parse', 'HEAD'])
const originMain = runGit(['rev-parse', 'origin/main'])
const trackedStatus = runGit(['status', '--short', '--untracked-files=all'])

if (branch !== 'main' || sha !== originMain || trackedStatus) {
  throw new Error('Release artifact requires clean local main equal to origin/main.')
}

const outputDir = path.resolve('.release-artifacts')
mkdirSync(outputDir, { recursive: true })
const archivePath = path.join(outputDir, `ams-realty-platform-starter-${sha}.tar.gz`)
const manifestPath = path.join(outputDir, `ams-realty-platform-starter-${sha}.json`)

runGit(['archive', '--format=tar.gz', `--output=${archivePath}`, sha])
const checksum = createHash('sha256').update(readFileSync(archivePath)).digest('hex')
const manifest = {
  archive: path.basename(archivePath),
  createdAt: new Date().toISOString(),
  node: '24.20.0',
  pnpm: '11.24.0',
  repository: 'integrator-p/ams-realty-platform-starter-next',
  sha,
  sha256: checksum,
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write(`${manifestPath}\n`)

