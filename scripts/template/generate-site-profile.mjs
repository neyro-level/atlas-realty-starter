import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = parseArgs(process.argv.slice(2))
const cwd = path.resolve('.')
const input = path.resolve(args.input ?? 'templates/site-profile.neutral.json')
const output = path.resolve(args.output ?? '.ams-client/site-profile.generated.ts')
const outputDir = path.dirname(output)
assertInsideCheckout(output)

const profile = JSON.parse(await readFile(input, 'utf8'))
validate(profile)
await assertIdentityAbsentFromSharedUi(profile)
await mkdir(outputDir, { recursive: true })

const files = [
  {
    path: output,
    contents: `import type { SiteProfile } from "@starter/site-contracts";\n\nexport const siteProfile = ${JSON.stringify(profile, null, 2)} as const satisfies SiteProfile;\n`,
  },
  {
    path: path.join(outputDir, 'brand-assets.generated.json'),
    contents: `${JSON.stringify({ logo: profile.logo, expertPortrait: profile.expert.portrait }, null, 2)}\n`,
  },
  {
    path: path.join(outputDir, 'DEPLOYMENT_CHECKLIST.md'),
    contents: deploymentChecklist(profile),
  },
]

for (const file of files) {
  assertInsideCheckout(file.path)
  await assertWritable(file.path)
  await writeFile(file.path, file.contents)
}

console.log(`Generated ${files.map((file) => path.relative(cwd, file.path)).join(', ')} from ${path.relative(cwd, input)}.`)

function assertInsideCheckout(target) {
  const relative = path.relative(cwd, target)
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Output must stay inside the project checkout.')
}

async function assertWritable(target) {
  if (args.force) return
  try {
    await readFile(target)
    throw new Error(`Output already exists: ${target}. Use --force to replace it.`)
  } catch (error) {
    if (error instanceof Error && !('code' in error && error.code === 'ENOENT')) throw error
  }
}

async function assertIdentityAbsentFromSharedUi(profile) {
  const sharedRoots = [path.join(cwd, 'packages', 'site-ui')]
  const forbidden = [profile.brand, profile.city.nominative, profile.city.genitive, profile.city.prepositional]
    .map((value) => value.trim().toLocaleLowerCase('ru-RU'))
    .filter((value) => value.length > 3 && !['бренд', 'город', 'города', 'городе'].includes(value))
  if (!forbidden.length) return

  const { glob } = await import('node:fs/promises')
  for (const root of sharedRoots) {
    for await (const file of glob('**/*.{ts,tsx,css,json}', { cwd: root })) {
      const contents = (await readFile(path.join(root, file), 'utf8')).toLocaleLowerCase('ru-RU')
      const leaked = forbidden.find((value) => contents.includes(value))
      if (leaked) throw new Error(`Client identity "${leaked}" leaked into shared UI: ${path.join('packages/site-ui', file)}`)
    }
  }
}

function validate(value) {
  const required = [value.brand, value.legalName, value.projectName, value.city?.nominative, value.city?.genitive, value.city?.prepositional, value.city?.slug, value.domain, value.expert?.name, value.expert?.role, value.expert?.portrait, value.contacts?.phone, value.contacts?.email, value.contacts?.address, value.legal?.name, value.legal?.inn, value.legal?.registrationNumber, value.logo?.mark, value.logo?.favicon, value.logo?.socialPreview, value.seo?.title, value.seo?.description, value.theme?.preset]
  if (required.some((entry) => typeof entry !== 'string' || entry.trim().length < 2)) throw new Error('Profile contains missing required identity, content, theme or asset fields.')
  const url = new URL(value.domain)
  if (url.protocol !== 'https:') throw new Error('Production profile domain must use HTTPS.')
  if (!Array.isArray(value.map?.center) || value.map.center.length !== 2 || value.map.center.some((entry) => !Number.isFinite(entry))) throw new Error('Map center must contain latitude and longitude.')
  if (!/^[a-z0-9-]+$/.test(value.city.slug)) throw new Error('City slug must contain lowercase latin letters, digits and hyphens only.')
  if (value.features?.catalogMap && value.map.center[0] === 0 && value.map.center[1] === 0) throw new Error('Catalog map requires reviewed city coordinates.')
}

function deploymentChecklist(profile) {
  return `# Deployment checklist — ${profile.brand}\n\n- [ ] Проверены бренд, название проекта и формы города: ${profile.city.nominative}, ${profile.city.genitive}, ${profile.city.prepositional}.\n- [ ] Добавлены логотип, favicon, social preview и портрет эксперта из brand-assets.generated.json.\n- [ ] Проверены телефон, email, публичный и юридический адреса.\n- [ ] Проверены SEO title/description и indexable; до приёмки используется noindex.\n- [ ] Координаты и масштаб карты подтверждены; ключ Яндекс Карт хранится только в Doppler.\n- [ ] Созданы отдельные PostgreSQL, S3, Doppler config и deployment-контур клиента.\n- [ ] Bootstrap и импорт повторно запускаются без дублей.\n- [ ] Production выпущен из exact merged main, проверены healthz, release SHA, заявки, медиа и rollback.\n`
}

function parseArgs(values) {
  const result = { force: false }
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === '--force') result.force = true
    else if (values[index] === '--input' || values[index] === '--output') result[values[index].slice(2)] = values[++index]
    else throw new Error(`Unknown argument: ${values[index]}`)
  }
  return result
}
