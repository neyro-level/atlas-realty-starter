import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve('.')
const violations = []
const configPath = resolve(root, 'src/payload.config.ts')
const migrationDirectory = resolve(root, 'src/payload/migrations-v2')
const migrationIndexPath = resolve(migrationDirectory, 'index.ts')
const packageJSON = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const config = readFileSync(configPath, 'utf8')
const migrationIndex = readFileSync(migrationIndexPath, 'utf8')

for (const required of ["push: false", "migrationDir: path.resolve(dirname, 'payload/migrations-v2')"]) {
  if (!config.includes(required)) violations.push({ file: 'src/payload.config.ts', rule: 'payload-schema-lifecycle', value: required })
}

for (const forbidden of ['@prisma/client', 'prisma', 'drizzle-orm', 'typeorm', 'sequelize']) {
  if (packageJSON.dependencies?.[forbidden] || packageJSON.devDependencies?.[forbidden]) {
    violations.push({ file: 'package.json', rule: 'single-schema-owner', value: forbidden })
  }
}

const migrationFiles = readdirSync(migrationDirectory)
  .filter((name) => /^20\d{6}_.*\.ts$/.test(name))
  .map((name) => name.slice(0, -3))
  .sort()
const indexedNames = [...migrationIndex.matchAll(/name:\s*'([^']+)'/g)].map((match) => match[1]).sort()
const importedNames = [...migrationIndex.matchAll(/from\s+'\.\/([^']+)'/g)].map((match) => match[1]).sort()

if (new Set(migrationFiles).size !== migrationFiles.length) violations.push({ file: 'src/payload/migrations-v2', rule: 'duplicate-migration-file' })
if (JSON.stringify(migrationFiles) !== JSON.stringify(indexedNames)) violations.push({ file: 'src/payload/migrations-v2/index.ts', rule: 'migration-index-names', expected: migrationFiles, actual: indexedNames })
if (JSON.stringify(migrationFiles) !== JSON.stringify(importedNames)) violations.push({ file: 'src/payload/migrations-v2/index.ts', rule: 'migration-index-imports', expected: migrationFiles, actual: importedNames })

for (const artifact of ['src/payload-types.ts', 'src/app/(payload)/admin/importMap.js']) {
  if (!existsSync(resolve(root, artifact))) violations.push({ file: artifact, rule: 'generated-artifact-missing' })
}

const drift = spawnSync('git', ['diff', '--exit-code', '--', 'src/payload-types.ts', 'src/app/(payload)/admin/importMap.js'], { cwd: root, encoding: 'utf8' })
if (drift.status !== 0) violations.push({ file: 'generated Payload artifacts', rule: 'generated-artifact-drift' })

console.log(JSON.stringify({ status: violations.length ? 'FAIL' : 'PASS', migrations: migrationFiles.length, violations }, null, 2))
if (violations.length) process.exit(1)
