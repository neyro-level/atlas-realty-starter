import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const auditScript = resolve('scripts/starter/audit.mjs')
const sourceManifest = JSON.parse(readFileSync(resolve('starter.manifest.json'), 'utf8'))
const fixtures: string[] = []

afterEach(() => {
  while (fixtures.length) rmSync(fixtures.pop()!, { force: true, recursive: true })
})

describe('starter export audit inventory', () => {
  it('rejects client markers even in CLIENT-classified files', () => {
    const root = fixture()
    mkdirSync(join(root, 'src', 'project'), { recursive: true })
    writeFileSync(join(root, 'src', 'project', 'client.ts'), `export const name = 'Союз Застройщиков'\n`)
    writeFileSync(join(root, 'starter.manifest.json'), JSON.stringify(sourceManifest))
    writeFileSync(join(root, '.starter-inventory.json'), JSON.stringify({ files: ['.starter-inventory.json', 'starter.manifest.json', 'src/project/client.ts'] }))

    const result = run(root, 'export')
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('"status": "FAIL"')
    expect(result.stdout).toContain('src/project/client.ts')
    expect(result.stdout).toContain('Союз')
  })

  it('returns NOT_RUN without Git or an explicit starter inventory', () => {
    const root = fixture()
    writeFileSync(join(root, 'starter.manifest.json'), JSON.stringify(sourceManifest))
    mkdirSync(join(root, '.pnpm-store', 'nested'), { recursive: true })
    writeFileSync(join(root, '.pnpm-store', 'nested', 'client.ts'), `export const name = 'Союз'\n`)

    const result = run(root, 'export')
    expect(result.status).toBe(2)
    expect(result.stdout).toContain('"status": "NOT_RUN"')
    expect(result.stdout).toContain('.starter-inventory.json is missing')
    expect(result.stdout).not.toContain('.pnpm-store/nested/client.ts')
  })
})

function fixture() {
  const path = mkdtempSync(join(tmpdir(), 'starter-audit-'))
  fixtures.push(path)
  return path
}

function run(root: string, mode: 'export' | 'source') {
  return spawnSync(process.execPath, [auditScript, '--root', root, '--mode', mode], {
    encoding: 'utf8',
  })
}
