import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const staticRoot = path.join(process.cwd(), '.next', 'static', 'chunks')
const required = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_INDEXABLE: process.env.NEXT_PUBLIC_INDEXABLE,
  NEXT_PUBLIC_YANDEX_MAPS_API_KEY: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
}

if (!existsSync(staticRoot)) throw new Error('Missing .next/static/chunks. Run pnpm build first.')

for (const [key, value] of Object.entries(required)) {
  if (!value) throw new Error(`${key} must be set for a production artifact.`)
}

const files = []
const visit = (directory) => {
  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry)
    if (statSync(entryPath).isDirectory()) visit(entryPath)
    else if (entryPath.endsWith('.js')) files.push(entryPath)
  }
}
visit(staticRoot)

const chunks = files.map((file) => readFileSync(file, 'utf8')).join('\n')
if (!chunks.includes(required.NEXT_PUBLIC_SITE_URL)) {
  throw new Error('NEXT_PUBLIC_SITE_URL was not inlined into browser chunks.')
}

if (!chunks.includes(required.NEXT_PUBLIC_YANDEX_MAPS_API_KEY)) {
  throw new Error('NEXT_PUBLIC_YANDEX_MAPS_API_KEY was not inlined into browser chunks.')
}

if (chunks.includes('process.env.NEXT_PUBLIC_SITE_URL')) {
  throw new Error('Browser chunks still contain a runtime NEXT_PUBLIC_SITE_URL lookup.')
}

process.stdout.write(`public_env_inline_ok site=${required.NEXT_PUBLIC_SITE_URL} indexable=${required.NEXT_PUBLIC_INDEXABLE}\n`)
