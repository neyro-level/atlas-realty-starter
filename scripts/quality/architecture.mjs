import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve('.')
const command = process.platform === 'win32' ? 'cmd.exe' : 'pnpm'
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'pnpm', 'exec', 'depcruise', '-c', '.dependency-cruiser.cjs', '-T', 'json', 'src', 'packages']
  : ['exec', 'depcruise', '-c', '.dependency-cruiser.cjs', '-T', 'json', 'src', 'packages']
const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
if (result.status !== 0 && !result.stdout) {
  process.stderr.write(result.stderr || 'Dependency Cruiser failed\n')
  process.exit(result.status ?? 1)
}

const cruise = JSON.parse(result.stdout)
const modules = new Map(cruise.modules.map((module) => [normalize(module.source), module]))
const violations = []
const tenantConfigPath = 'src/project/tenant.config.ts'
const protectedTenantValues = ['atlas.ams24.ru', '+7 (918) 320-99-96', 'ИП Скрицкая Юлия Викторовна', '231295699557']

for (const violation of cruise.summary?.violations ?? []) {
  violations.push({ from: normalize(violation.from), rule: violation.rule?.name ?? 'dependency-cruiser', to: normalize(violation.to) })
}

for (const [source, module] of modules) {
  if (/^(?:src|packages)\//.test(source)) {
    const sourceText = readFileSync(resolve(root, source), 'utf8')
    const rawDatabaseUse = /(?:\b(?:payload|context\.payload)\.db\b|\badapter\.pool\b|\b(?:sql|execute)\s*`)/.test(sourceText)
    const approvedRawDatabasePath = source.startsWith('src/core/data-access/ingest/') ||
      source.startsWith('src/core/data-access/optimized-read/') ||
      source.startsWith('src/payload/migrations-v2/')
    if (rawDatabaseUse && !approvedRawDatabasePath) {
      violations.push({ from: source, rule: 'raw-database-approved-boundaries-only', to: 'database' })
    }
    const hasPayloadOperation = /\b(?:payload|req\.payload|context\.payload)\.(?:find|findByID|findGlobal|create|update|delete|count|auth|jobs)\b/.test(sourceText)
    if (hasPayloadOperation && !source.startsWith('src/core/data-access/')) {
      violations.push({ from: source, rule: 'payload-operations-through-gateways-only', to: 'payload' })
    }
    if (/overrideAccess\s*:\s*true/.test(sourceText) && !source.startsWith('src/core/data-access/system/')) {
      violations.push({ from: source, rule: 'privileged-payload-access-system-gateway-only', to: 'overrideAccess' })
    }
    if (source.includes('/leads/adapters/') && /\bfetch\s*\(/.test(sourceText)) {
      violations.push({ from: source, rule: 'lead-adapters-use-outbound-http-client', to: 'fetch' })
    }
    if (source !== tenantConfigPath) {
      for (const value of protectedTenantValues) {
        if (sourceText.includes(value)) violations.push({ from: source, rule: 'tenant-identity-single-source', to: tenantConfigPath })
      }
    }
    const providerURL = /['"`](https:\/\/(?:api-maps\.yandex\.ru|yastatic\.net|mc\.yandex\.ru|yandex\.ru|[^/'"`]+\.maps\.yandex\.net)[^'"`]*)['"`]/g
    const providerBoundary = source.startsWith('src/core/integrations/') || source.startsWith('src/core/security/outbound-http/')
    const contentOrTest = source.includes('/content/') || isTestPath(source)
    if (!providerBoundary && !contentOrTest && providerURL.test(sourceText)) {
      violations.push({ from: source, rule: 'external-provider-urls-in-integrations-only', to: 'src/core/integrations' })
    }
  }
  const sourceModule = moduleName(source)
  for (const dependency of module.dependencies ?? []) {
    const target = normalize(dependency.resolved)
    if (!target.startsWith('src/')) continue

    const targetModule = moduleName(target)
    if (sourceModule && targetModule && sourceModule !== targetModule && !/^index\.[cm]?[jt]sx?$/.test(basename(target))) {
      violations.push({ from: source, rule: 'no-cross-module-internals', to: target })
    }

    for (const rootPath of ['src/project/ingest/', 'src/project/leads/channels/']) {
      const sourceSibling = siblingName(source, rootPath)
      const targetSibling = siblingName(target, rootPath)
      if (sourceSibling && targetSibling && sourceSibling !== targetSibling) {
        violations.push({ from: source, rule: 'no-cross-sibling-internals', to: target })
      }
    }
    if (source.startsWith('src/') && isTestPath(target)) {
      violations.push({ from: source, rule: 'no-production-to-tests', to: target })
    }
  }
}

const routeRegistryPath = resolve(root, 'src/project/routes.ts')
if (!readFileSync(resolve(root, 'src/core/data-access/public/sitemap.ts'), 'utf8').includes('sitemapPathFor')) {
  violations.push({ from: 'src/core/data-access/public/sitemap.ts', rule: 'sitemap-uses-route-registry', to: 'src/project/routes.ts' })
}
const routeRegistry = readFileSync(routeRegistryPath, 'utf8')
for (const match of routeRegistry.matchAll(/appEntry:\s*['"]([^'"]+)['"]/g)) {
  if (!readFileSafe(resolve(root, match[1]))) violations.push({ from: 'src/project/routes.ts', rule: 'registered-route-entry-exists', to: match[1] })
}

const clientFiles = [...modules.keys()].filter(isClientModule)
for (const source of clientFiles) {
  const reached = traverse(source)
  for (const target of reached) {
    if (target === source || !isServerBoundary(target)) continue
    violations.push({ from: source, rule: 'no-client-to-server', to: target })
  }
}

const unique = [...new Map(violations.map((violation) => [`${violation.rule}|${violation.from}|${violation.to}`, violation])).values()]
console.log(JSON.stringify({
  status: unique.length ? 'FAIL' : 'PASS',
  modules: modules.size,
  dependencies: [...modules.values()].reduce((total, module) => total + (module.dependencies?.length ?? 0), 0),
  clientModules: clientFiles.length,
  violations: unique,
}, null, 2))
if (unique.length) process.exit(1)

function traverse(start) {
  const seen = new Set()
  const pending = [start]
  while (pending.length) {
    const current = pending.pop()
    if (seen.has(current)) continue
    seen.add(current)
    if (current !== start && isServerActionBoundary(current)) continue
    const moduleInfo = modules.get(current)
    for (const dependency of moduleInfo?.dependencies ?? []) {
      const target = normalize(dependency.resolved)
      if (target.startsWith('src/') && !seen.has(target)) pending.push(target)
    }
  }
  return seen
}

function isServerActionBoundary(path) {
  try {
    return /^\s*(['"])use server\1;?/m.test(readFileSync(resolve(root, path), 'utf8'))
  } catch {
    return false
  }
}

function isClientModule(path) {
  if (!/\.[cm]?[jt]sx?$/.test(path)) return false
  try {
    return /^\s*(['"])use client\1;?/m.test(readFileSync(resolve(root, path), 'utf8'))
  } catch {
    return false
  }
}

function isServerBoundary(path) {
  if (path === 'src/payload.config.ts') return true
  if (/^src\/payload\/(access|collections|globals|hooks)\//.test(path)) return true
  if (path === 'src/project/env.ts') return true
  try {
    return /(?:import|require)\s*\(?['"]server-only['"]\)?/.test(readFileSync(resolve(root, path), 'utf8'))
  } catch {
    return false
  }
}

function moduleName(path) {
  const match = path.match(/^src\/(?:modules|project\/modules)\/([^/]+)\//)
  return match?.[1] ?? null
}

function siblingName(path, rootPath) {
  if (!path.startsWith(rootPath)) return null
  const remainder = path.slice(rootPath.length)
  if (!remainder.includes('/')) return null
  return remainder.split('/')[0] || null
}

function isTestPath(path) {
  return path.startsWith('tests/') || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path) || /\/fixtures?\//.test(path)
}

function normalize(path) {
  return String(path ?? '').replaceAll('\\', '/')
}

function readFileSafe(path) {
  try { readFileSync(path); return true } catch { return false }
}
