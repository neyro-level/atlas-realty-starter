import { existsSync, readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve('.')
const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
if (result.status !== 0) throw new Error(result.stderr || 'Unable to list tracked files.')

const allowedExact = new Set([
  '.sourcecraft/ci.yaml',
  'AGENTS.md',
  'playwright.config.ts',
  'playwright.visual.config.ts',
  'README.md',
  'scripts/provision-staging-runtime.ps1',
  'scripts/run-native-integration.mjs',
  'src/core/data-access/system/operations.ts',
  'src/lib/catalog.ts',
  'src/payload/migrations-v2/index.ts',
  'src/project/bootstrap-krasnodar-complexes.ts',
])
const allowedPrefixes = [
  'deploy/',
  'docs/',
  'packages/site-fixtures/',
  'scripts/fixtures/',
  'scripts/quality/',
  'src/project/',
  'src/core/data-access/system/bootstrap/',
  'src/entities/article/',
  'src/modules/new-buildings/content/',
  'tests/',
]
const allowedContent = /(?:^|\/)(?:[^/]+-content|journal-config|journal-page-data)\.[cm]?[jt]sx?$/u
const textExtensions = new Set([
  '.cjs',
  '.css',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.mts',
  '.scss',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])
const tenantResidue = /atlas|ams24|краснодар|krasnodar/iu
const violations = []

for (const rawPath of result.stdout.split('\0').filter(Boolean)) {
  const path = rawPath.replaceAll('\\', '/')
  if (!textExtensions.has(extname(path)) || isAllowed(path)) continue
  const absolute = resolve(root, rawPath)
  if (!existsSync(absolute)) continue
  const source = readFileSync(absolute, 'utf8')
  if (tenantResidue.test(source)) violations.push(path)
}

console.log(
  JSON.stringify(
    {
      status: violations.length ? 'FAIL' : 'PASS',
      rule: 'tenant-residue-only-in-explicit-tenant-reference-or-fixture-zones',
      violations,
    },
    null,
    2,
  ),
)
if (violations.length) process.exit(1)

function isAllowed(path) {
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(path)) return true
  if (allowedExact.has(path)) return true
  if (allowedPrefixes.some((prefix) => path.startsWith(prefix))) return true
  return allowedContent.test(path)
}
