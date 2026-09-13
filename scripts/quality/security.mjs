import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve('.')
const violations = []
const sourceFiles = walk(resolve(root, 'src')).filter((file) => ['.ts', '.tsx', '.mts', '.mjs'].includes(extname(file)))
const packageJSON = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const payloadConfig = readFileSync(resolve(root, 'src/payload.config.ts'), 'utf8')
const securityHeaders = readFileSync(resolve(root, 'src/core/security/headers.ts'), 'utf8')
const usersCollection = readFileSync(resolve(root, 'src/payload/collections/Users.ts'), 'utf8')
const envExample = readFileSync(resolve(root, '.env.example'), 'utf8')

for (const [group, dependencies] of Object.entries({
  dependencies: packageJSON.dependencies ?? {},
  devDependencies: packageJSON.devDependencies ?? {},
})) {
  for (const [name, version] of Object.entries(dependencies)) {
    if (typeof version !== 'string' || version.startsWith('workspace:')) continue
    if (/^[~^*]|\s-\s|\|\||[<>]/.test(version)) {
      violations.push({ file: 'package.json', rule: 'exact-direct-dependency-version', value: group + '.' + name + '=' + version })
    }
  }
}

for (const forbidden of ['@prisma/client', 'prisma', 'drizzle-orm', 'typeorm', 'sequelize', '@sentry/nextjs', 'graphql']) {
  if (packageJSON.dependencies?.[forbidden] || packageJSON.devDependencies?.[forbidden]) {
    violations.push({ file: 'package.json', rule: 'single-schema-owner', value: forbidden })
  }
}

for (const [needle, rule] of [
  ['blocksAsJSON: true', 'postgres-blocks-as-json'],
  ["idType: 'uuid'", 'postgres-uuid'],
  ['push: false', 'no-schema-push'],
  ['defaultDepth: 0', 'default-depth-zero'],
  ['disable: true', 'graphql-disabled'],
  ['localization: false', 'localization-disabled'],
  ['maxDepth: 3', 'max-depth-three'],
  ['serverURL: allowedOrigin', 'exact-server-url'],
  ['cors: [allowedOrigin]', 'exact-cors-origin'],
  ['csrf: [allowedOrigin]', 'exact-csrf-origin'],
]) {
  if (!payloadConfig.includes(needle)) violations.push({ file: 'src/payload.config.ts', rule })
}
if (payloadConfig.includes('onInit:')) violations.push({ file: 'src/payload.config.ts', rule: 'no-automatic-user-bootstrap' })
if (!usersCollection.includes('unlock: canDeleteUsers')) violations.push({ file: 'src/payload/collections/Users.ts', rule: 'owner-only-user-unlock' })

for (const header of [
  'Content-Security-Policy',
  'Permissions-Policy',
  'Referrer-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
]) {
  if (!securityHeaders.includes(header)) violations.push({ file: 'src/core/security/headers.ts', rule: 'security-header', value: header })
}
if (securityHeaders.includes('Content-Security-Policy-Report-Only')) {
  violations.push({ file: 'src/core/security/headers.ts', rule: 'csp-must-be-enforced' })
}

for (const variable of ['DATABASE_URL', 'PAYLOAD_SECRET', 'NEXT_PUBLIC_SITE_URL', 'REVALIDATE_SECRET', 'AMS_LEADS_API_URL', 'AMS_LEADS_PROJECT_ID', 'AMS_LEADS_SITE_KEY', 'S3_ACCESS_KEY_ID', 'S3_BUCKET', 'S3_REGION', 'S3_SECRET_ACCESS_KEY']) {
  if (!new RegExp(`^# @required [^\\n]+\\n${variable}=`, 'mu').test(envExample)) {
    violations.push({ file: '.env.example', rule: 'required-environment-marker', value: variable })
  }
}
for (const line of envExample.split(/\r?\n/u)) {
  if (line && !line.startsWith('#') && !/^[A-Z][A-Z0-9_]*=/u.test(line)) {
    violations.push({ file: '.env.example', rule: 'invalid-environment-line', value: line })
  }
}

const allowedProcessEnvFiles = new Set([
  'next.config.ts',
  'src/project/bootstrap-owner-env.ts',
  'src/project/env.ts',
  'src/project/public-env.ts',
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

  const hasPayloadOperation = /\b(?:payload|req\.payload|context\.payload)\.(?:find|findByID|findGlobal|create|update|delete|count|auth|jobs)\b/.test(source)
  if (hasPayloadOperation && !path.startsWith('src/core/data-access/')) {
    violations.push({ file: path, rule: 'payload-operation-outside-gateway' })
  }
  if (/overrideAccess\s*:\s*true/.test(source) &&
      !path.startsWith('src/core/data-access/system/')) {
    violations.push({ file: path, rule: 'privileged-operation-outside-system-gateway' })
  }
  if (/(?:payload|context\.payload)\.db\b|adapter\.pool\b/.test(source) &&
      !path.startsWith('src/core/data-access/ingest/') &&
      !path.startsWith('src/core/data-access/optimized-read/') &&
      !path.startsWith('src/payload/migrations') ) {
    violations.push({ file: path, rule: 'raw-database-outside-ingest-gateway' })
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

for (const forbiddenPath of [
  'src/app/(payload)/api/health/route.ts',
  'src/payload/admin',
  'src/instrumentation-client.ts',
  'src/instrumentation.ts',
  'sentry.edge.config.ts',
  'sentry.server.config.ts',
]) {
  if (existsSync(resolve(root, forbiddenPath))) violations.push({ file: forbiddenPath, rule: 'inactive-baseline-component' })
}

console.log(JSON.stringify({
  status: violations.length ? 'FAIL' : 'PASS',
  enforcedStandard: 'AMS Realty Platform Core 4.0 project security baseline',
  violations,
}, null, 2))
if (violations.length) process.exit(1)

function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function trackedTextFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) return []
  return result.stdout.split('\0').filter(Boolean).filter((path) => {
    const normalized = normalize(path)
    if (/^(?:pnpm-lock\.yaml|src\/payload-types\.ts|src\/payload\/migrations.*\/.*\.json)$/.test(normalized)) return false
    return ['.cjs', '.css', '.js', '.json', '.md', '.mjs', '.mts', '.scss', '.ts', '.tsx', '.yaml', '.yml'].includes(extname(path))
  }).map((path) => resolve(root, path)).filter(existsSync)
}

function normalize(path) {
  return String(path).replaceAll('\\', '/')
}
