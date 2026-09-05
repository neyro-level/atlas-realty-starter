import { cpSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const standaloneRoot = path.join(projectRoot, '.next', 'standalone')
if (!existsSync(path.join(standaloneRoot, 'server.js'))) {
  throw new Error('Missing standalone server after Next.js build.')
}

for (const envFile of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  rmSync(path.join(standaloneRoot, envFile), { force: true })
}

const staticRoot = path.join(projectRoot, '.next', 'static')
if (existsSync(staticRoot)) {
  cpSync(staticRoot, path.join(standaloneRoot, '.next', 'static'), { recursive: true })
}

const publicRoot = path.join(projectRoot, 'public')
if (existsSync(publicRoot)) {
  cpSync(publicRoot, path.join(standaloneRoot, 'public'), { recursive: true })
}
