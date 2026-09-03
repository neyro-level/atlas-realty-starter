import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve('.')
const command = process.platform === 'win32' ? 'cmd.exe' : 'pnpm'
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'pnpm', 'exec', 'depcruise', '-c', '.dependency-cruiser.cjs', '-T', 'json', 'src']
  : ['exec', 'depcruise', '-c', '.dependency-cruiser.cjs', '-T', 'json', 'src']
const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
if (result.status !== 0 && !result.stdout) {
  process.stderr.write(result.stderr || 'Dependency Cruiser failed\n')
  process.exit(result.status ?? 1)
}

const cruise = JSON.parse(result.stdout)
const modules = new Map(cruise.modules.map((module) => [normalize(module.source), module]))
const violations = []

for (const violation of cruise.summary?.violations ?? []) {
  violations.push({ from: normalize(violation.from), rule: violation.rule?.name ?? 'dependency-cruiser', to: normalize(violation.to) })
}

for (const [source, module] of modules) {
  const sourceModule = moduleName(source)
  for (const dependency of module.dependencies ?? []) {
    const target = normalize(dependency.resolved)
    if (!target.startsWith('src/')) continue

    const targetModule = moduleName(target)
    if (sourceModule && targetModule && sourceModule !== targetModule && !/^index\.[cm]?[jt]sx?$/.test(basename(target))) {
      violations.push({ from: source, rule: 'no-cross-module-internals', to: target })
    }
    if (source.startsWith('src/') && isTestPath(target)) {
      violations.push({ from: source, rule: 'no-production-to-tests', to: target })
    }
  }
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
    const moduleInfo = modules.get(current)
    for (const dependency of moduleInfo?.dependencies ?? []) {
      const target = normalize(dependency.resolved)
      if (target.startsWith('src/') && !seen.has(target)) pending.push(target)
    }
  }
  return seen
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
  if (/^src\/payload\/(access|collections|globals|hooks|public|admin\/queries)\//.test(path) || path === 'src/payload/admin/lib/context.ts') return true
  if (path === 'src/project/env.ts') return true
  try {
    return /(?:import|require)\s*\(?['"]server-only['"]\)?/.test(readFileSync(resolve(root, path), 'utf8'))
  } catch {
    return false
  }
}

function moduleName(path) {
  const match = path.match(/^src\/modules\/([^/]+)\//)
  return match?.[1] ?? null
}

function isTestPath(path) {
  return path.startsWith('tests/') || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path) || /\/fixtures?\//.test(path)
}

function normalize(path) {
  return String(path ?? '').replaceAll('\\', '/')
}
