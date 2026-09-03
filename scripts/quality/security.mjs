import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve('.')
const violations = []
const sourceFiles = walk(resolve(root, 'src')).filter((file) => ['.ts', '.tsx', '.mts', '.mjs'].includes(extname(file)))
const packageJSON = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const payloadConfig = readFileSync(resolve(root, 'src/payload.config.ts'), 'utf8')
const securityHeaders = readFileSync(resolve(root, 'src/core/security/headers.ts'), 'utf8')

for (const [group, dependencies] of Object.entries({
  dependencies: packageJSON.dependencies ?? {},
  devDependencies: packageJSON.devDependencies ?? {},
})) {
  for (const [name, version] of Object.entries(dependencies)) {
    if (typeof version !== 'string' || version.startsWith('workspace:')) continue
    if (/^[~^*]|\s-\s|\|\||[<>]/.test(version)) {
      violations.push({ file: 'package.json', rule: 'exact-direct-dependency-version', value: `${group}.${name}=${version}` })
    }
  }
}

for (const forbidden of ['@prisma/client', 'prisma', 'drizzle-orm', 'typeorm', 'sequelize']) {
  if (packageJSON.dependencies?.[forbidden] || packageJSON.devDependencies?.[forbidden]) {
    violations.push({ file: 'package.json', rule: 'single-schema-owner', value: forbidden })
  }
}

const requiredPayloadConfig = [
  ["blocksAsJSON: true", 'postgres-blocks-as-json'],
  ["idType: 'uuid'", 'postgres-uuid'],
  ['push: false', 'no-schema-push'],
  ['defaultDepth: 0', 'default-depth-zero'],
  ['disable: true', 'graphql-disabled'],
  ['localization: false', 'localization-disabled'],
  ['maxDepth: 3', 'max-depth-three'],
]
for (const [needle, rule] of requiredPayloadConfig) {
  if (!payloadConfig.includes(needle)) violations.push({ file: 'src/payload.config.ts', rule })
}

for (const header of [
  'Content-Security-Policy-Report-Only',
  'Permissions-Policy',
  'Referrer-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
]) {
  if (!securityHeaders.includes(header)) violations.push({ file: 'src/core/security/headers.ts', rule: 'security-header', value: header })
}

const allowedProcessEnvFiles = new Set([
  'next.config.ts',
  'sentry.edge.config.ts',
  'sentry.server.config.ts',
  'src/instrumentation-client.ts',
  'src/instrumentation.ts',
  'src/project/build-env.ts',
  'src/project/env.ts',
  'src/project/public-env.ts',
  'src/project/sentry-server-env.ts',
])
for (const file of sourceFiles) {
  const path = normalize(relative(root, file))
  const source = readFileSync(file, 'utf8')
  if (source.includes('process.env') && !allowedProcessEnvFiles.has(path)) {
    violations.push({ file: path, rule: 'central-environment-access' })
  }
  if (/\bfetch\s*\(/.test(source) && !path.startsWith('src/core/security/outbound-http/')) {
    violations.push({ file: path, rule: 'central-outbound-http' })
  }
  if (/\bcors\s*:\s*['"]\*['"]|\bcsrf\s*:\s*['"]\*['"]/.test(source)) {
    violations.push({ file: path, rule: 'no-wildcard-origin' })
  }
}

for (const file of trackedTextFiles()) {
  const path = normalize(relative(root, file))
  const source = readFileSync(file, 'utf8')
  if (/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\bdp\.st\.[A-Za-z0-9._-]{20,}|\bgh[pousr]_[A-Za-z0-9]{20,}|\bsk-[A-Za-z0-9]{20,}|\bBearer\s+[A-Za-z0-9._-]{20,}/.test(source)) {
    violations.push({ file: path, rule: 'tracked-secret-pattern' })
  }
  if (/https?:\/\/[^/\s:@]+:[^@\s]+@/.test(source) && path !== '.env.example') {
    violations.push({ file: path, rule: 'credential-bearing-http-url' })
  }
}

const deferred = {
  directPayloadOperations: sourceFiles.filter((file) => {
    const path = normalize(relative(root, file))
    return !path.startsWith('src/core/data-access/') && /\b(?:payload|req\.payload|context\.payload)\.(?:find|findByID|findGlobal|create|update|delete|count|auth|jobs)\b/.test(readFileSync(file, 'utf8'))
  }).map((file) => normalize(relative(root, file))),
  privilegedPayloadOperations: sourceFiles.filter((file) => /overrideAccess\s*:\s*true/.test(readFileSync(file, 'utf8'))).map((file) => normalize(relative(root, file))),
  rawDatabaseAccess: sourceFiles.filter((file) => /(?:payload|context\.payload)\.db\b|adapter\.pool\b/.test(readFileSync(file, 'utf8'))).map((file) => normalize(relative(root, file))),
}

console.log(JSON.stringify({
  status: violations.length ? 'FAIL' : 'PASS',
  enforcedWave: 0,
  deferredUntilOwningWave: deferred,
  violations,
}, null, 2))
if (violations.length) process.exit(1)

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    return [path]
  })
}

function trackedTextFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || 'git ls-files failed')
  return result.stdout.split('\0').filter(Boolean).filter((path) => {
    if (/^(?:pnpm-lock\.yaml|src\/payload-types\.ts|src\/payload\/migrations\/.*\.json)$/.test(normalize(path))) return false
    return ['.cjs', '.css', '.js', '.json', '.md', '.mjs', '.mts', '.scss', '.ts', '.tsx', '.yaml', '.yml'].includes(extname(path))
  }).map((path) => resolve(root, path))
}

function normalize(path) {
  return String(path).replaceAll('\\', '/')
}
