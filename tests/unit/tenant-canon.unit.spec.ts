import { existsSync, globSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { siteIdentity, siteProfile, tenant, tenantConfig } from '@/project/tenant.config'

describe('tenant initialization contract', () => {
  it('keeps identity and profile as views of the single tenant config', () => {
    expect(siteIdentity).toBe(tenantConfig)
    expect(siteProfile).toBe(tenantConfig)
    expect(tenant.brand).toBe(tenantConfig.brand)
    expect(tenant.cityRu).toBe(tenantConfig.city.nominative)
    expect(tenant.leadChannels).toEqual(['ams-leads'])
    expect(existsSync('src/project/tenant.ts')).toBe(false)
    expect(existsSync('src/project/site-identity.ts')).toBe(false)
    expect(existsSync('src/project/site-profile.ts')).toBe(false)
  })

  it('uses one workspace package namespace', () => {
    const files = globSync(['src/**/*.{ts,tsx,css}', 'packages/**/*.{ts,tsx,css,json}', 'package.json', 'next.config.ts'])
    for (const file of files) expect(readFileSync(file, 'utf8')).not.toContain('@ams/realty-ui')
    expect(JSON.parse(readFileSync('packages/site-ui/package.json', 'utf8')).name).toBe('@starter/site-ui')
  })

  it('does not duplicate tenant contact, legal, or domain values in product code', () => {
    const files = globSync(['src/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'])
      .filter((file) => file.replaceAll('\\', '/') !== 'src/project/tenant.config.ts')
    const protectedValues = ['atlas.ams24.ru', '+7 (918) 320-99-96', 'ИП Скрицкая Юлия Викторовна', '231295699557']
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const value of protectedValues) expect(source, `${value} duplicated in ${file}`).not.toContain(value)
    }
  })
})
