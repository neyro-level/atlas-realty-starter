import { spawnSync } from 'node:child_process'

const mode = process.argv[2]
const rawSiteURL = process.env.RELEASE_CHECK_SITE_URL?.trim()

if (!rawSiteURL) {
  throw new Error('RELEASE_CHECK_SITE_URL is required for release build checks.')
}

const siteURL = new URL(rawSiteURL)
if (
  siteURL.protocol !== 'https:' ||
  siteURL.username ||
  siteURL.password ||
  siteURL.search ||
  siteURL.hash
) {
  throw new Error(
    'RELEASE_CHECK_SITE_URL must be a clean HTTPS origin without credentials, query or fragment.',
  )
}
if (siteURL.pathname !== '/') {
  throw new Error('RELEASE_CHECK_SITE_URL must not contain a path.')
}

const commands = {
  build: ['build'],
  'public-env': ['build:public-env:check'],
}
const args = commands[mode]
if (!args) throw new Error(`Unknown release check mode: ${mode ?? '<missing>'}`)

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const result = spawnSync(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NEXT_PUBLIC_INDEXABLE: 'false',
    NEXT_PUBLIC_SITE_URL: siteURL.origin,
  },
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
