import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(path), 'utf8')

describe('Stage 5 operations contract', () => {
  it('builds a standalone artifact before deployment', () => {
    expect(read('next.config.ts')).toContain("output: 'standalone'")
    expect(read('package.json')).toContain('node .next/standalone/server.js')
    const pack = read('scripts/build-release-artifact.mjs')
    expect(pack).toContain(".next', 'standalone")
    expect(pack).toContain('clean exact origin/main')
    expect(pack).toContain('buildBeforeDeploy: true')
  })

  it('installs without dependencies or a server-side build', () => {
    const installer = read('deploy/install-release.sh')
    expect(installer).not.toMatch(/pnpm install/)
    expect(installer).not.toMatch(/pnpm build/)
    expect(installer).toContain('src/payload/migrations-v2')
    expect(installer.indexOf('payload migrate')).toBeLessThan(installer.indexOf('current.next'))
  })

  it('uses one private worker for all queues and schedules', () => {
    const worker = read('deploy/ams-realty-platform-starter-worker.service')
    expect(worker).toContain('--all-queues --handle-schedules')
    expect(worker).toContain('ProtectSystem=full')
  })

  it('enforces TLS and separate login and lead limits', () => {
    const nginx = read('deploy/nginx-internal.conf')
    expect(nginx).toContain('listen 127.0.0.1:8443 ssl')
    expect(nginx).toContain('zone=payload_login')
    expect(nginx).toContain('zone=public_leads')
    expect(nginx).toContain('location ^~ /api/public/v1/')
    expect(nginx).toMatch(/location \^~ \/api\/ \{\s+return 403;/)
  })
})
