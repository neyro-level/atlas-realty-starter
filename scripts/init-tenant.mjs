import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const options = parseArguments(process.argv.slice(2))
if (options.help) {
  printHelp()
  process.exit(0)
}

const required = ['brand', 'city', 'city-genitive', 'city-prepositional', 'domain', 'legal-name', 'phone', 'slug']
const missing = required.filter((name) => !options[name])
if (missing.length) throw new Error(`Missing required options: ${missing.map((name) => `--${name}`).join(', ')}`)
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(options.slug)) throw new Error('--slug must be lowercase kebab-case')
const domain = new URL(options.domain)
if (domain.protocol !== 'https:') throw new Error('--domain must use HTTPS')
if (!options.force && !options['dry-run']) throw new Error('Initialization overwrites tenant files; repeat with --force or inspect with --dry-run')

const root = process.cwd()
const values = {
  slug: options.slug,
  brand: options.brand,
  projectName: options['project-name'] || `${options.brand} — агентство недвижимости в ${options['city-prepositional']}`,
  tagline: options.tagline || 'Навигация в мире недвижимости',
  city: {
    nominative: options.city,
    genitive: options['city-genitive'],
    prepositional: options['city-prepositional'],
    slug: options['city-slug'] || options.slug,
  },
  productionDomain: domain.toString().replace(/\/$/u, ''),
  contacts: {
    phone: options.phone,
    email: options.email || '',
    address: options.address || '',
    legalOperatorAddress: options['legal-address'] || options.address || '',
    hours: options.hours || '',
  },
  legal: {
    name: options['legal-name'],
    inn: options.inn || '',
    registrationNumber: options['registration-number'] || '',
  },
  map: {
    center: [numberOption('latitude', 55.751244), numberOption('longitude', 37.618423)],
    zoom: numberOption('zoom', 12),
    catalogZoom: numberOption('catalog-zoom', numberOption('zoom', 12)),
  },
  leadChannels: (options['lead-channels'] || 'ams-leads').split(',').map((value) => value.trim()).filter(Boolean),
}

const tenantPath = path.join(root, 'src', 'project', 'tenant.config.ts')
const tenantSource = await readFile(tenantPath, 'utf8')
const tenantBlock = `// BEGIN TENANT_VALUES\nconst tenantValues = ${toTypeScript(values)} as const\n// END TENANT_VALUES`
const nextTenantSource = replaceMarkedBlock(tenantSource, '// BEGIN TENANT_VALUES', '// END TENANT_VALUES', tenantBlock)

const packagePath = path.join(root, 'package.json')
const packageJSON = JSON.parse(await readFile(packagePath, 'utf8'))
packageJSON.name = `${values.slug}-realty-starter`

const readmePath = path.join(root, 'README.md')
const readme = await readFile(readmePath, 'utf8')
const readmeBlock = `<!-- BEGIN TENANT_README -->\n# ${values.brand} — недвижимость в ${values.city.prepositional}\n\nСамостоятельный продукт для рынка недвижимости ${values.city.genitive} на Next.js, Payload CMS и PostgreSQL.\n\nProduction-домен: \`${values.productionDomain}\`. Оператор: ${values.legal.name}. Индексация включается только отдельным production-решением владельца.\n<!-- END TENANT_README -->`
const nextReadme = replaceMarkedBlock(readme, '<!-- BEGIN TENANT_README -->', '<!-- END TENANT_README -->', readmeBlock)

const envExample = await readFile(path.join(root, '.env.example'), 'utf8')
const databaseSlug = values.slug.replaceAll('-', '_')
const env = envExample
  .replace(/^DATABASE_URL=.*$/mu, `DATABASE_URL=postgres://${databaseSlug}_local:replace-local-password@127.0.0.1:5435/${databaseSlug}_dev`)
  .replace(/^NEXT_PUBLIC_SITE_URL=.*$/mu, `NEXT_PUBLIC_SITE_URL=${values.productionDomain}`)
  .replace(/^AMS_LEADS_PROJECT_ID=.*$/mu, `AMS_LEADS_PROJECT_ID=${values.slug}`)

const writes = [
  [tenantPath, nextTenantSource],
  [packagePath, `${JSON.stringify(packageJSON, null, 2)}\n`],
  [readmePath, nextReadme],
  [path.join(root, '.env'), env],
]

if (options['dry-run']) {
  process.stdout.write(`${writes.map(([file]) => path.relative(root, file)).join('\n')}\n`)
} else {
  await Promise.all(writes.map(([file, content]) => writeFile(file, content, 'utf8')))
  process.stdout.write(`Tenant ${values.slug} initialized. Review tenant.config.ts and .env before starting the application.\n`)
}

function parseArguments(args) {
  return Object.fromEntries(args.map((argument) => {
    if (!argument.startsWith('--')) throw new Error(`Invalid argument: ${argument}`)
    const [name, ...rest] = argument.slice(2).split('=')
    return [name, rest.length ? rest.join('=') : true]
  }))
}

function numberOption(name, fallback) {
  const value = options[name] === undefined ? fallback : Number(options[name])
  if (!Number.isFinite(value)) throw new Error(`--${name} must be a number`)
  return value
}

function replaceMarkedBlock(source, start, end, replacement) {
  const from = source.indexOf(start)
  const to = source.indexOf(end)
  if (from < 0 || to < from) throw new Error(`Missing managed block: ${start}`)
  return `${source.slice(0, from)}${replacement}${source.slice(to + end.length)}`
}

function toTypeScript(value) {
  return JSON.stringify(value, null, 2).replace(/"([^"\n]+)":/gu, '$1:').replace(/\[\n\s+(-?\d+(?:\.\d+)?),\n\s+(-?\d+(?:\.\d+)?)\n\]/gu, '[$1, $2]')
}

function printHelp() {
  process.stdout.write('pnpm init:tenant -- --slug=<id> --brand=<name> --city=<name> --city-genitive=<name> --city-prepositional=<name> --domain=https://example.test --legal-name=<name> --phone=<phone> --force\n')
}
