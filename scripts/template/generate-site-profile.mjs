import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = parseArgs(process.argv.slice(2))
const input = path.resolve(args.input ?? 'templates/site-profile.neutral.json')
const output = path.resolve(args.output ?? '.atlas-client/site-profile.generated.ts')
const cwd = path.resolve('.')
if (path.relative(cwd, output).startsWith('..')) throw new Error('Output must stay inside the project checkout.')

const profile = JSON.parse(await readFile(input, 'utf8'))
validate(profile)
await mkdir(path.dirname(output), { recursive: true })
if (!args.force) {
  try {
    await readFile(output)
    throw new Error(`Output already exists: ${output}. Use --force to replace it.`)
  } catch (error) {
    if (error instanceof Error && !('code' in error && error.code === 'ENOENT')) throw error
  }
}
const source = `import type { SiteProfile } from "@starter/site-contracts";\n\nexport const siteProfile = ${JSON.stringify(profile, null, 2)} as const satisfies SiteProfile;\n`
await writeFile(output, source)
console.log(`Generated ${path.relative(cwd, output)} from ${path.relative(cwd, input)}.`)

function validate(value) {
  const required = [value.brand, value.legalName, value.projectName, value.city?.nominative, value.city?.genitive, value.city?.prepositional, value.city?.slug, value.domain, value.contacts?.phone, value.contacts?.email, value.contacts?.address, value.legal?.name, value.legal?.inn, value.legal?.registrationNumber, value.seo?.title, value.seo?.description]
  if (required.some((entry) => typeof entry !== 'string' || entry.trim().length < 2)) throw new Error('Profile contains missing required identity fields.')
  const url = new URL(value.domain)
  if (url.protocol !== 'https:') throw new Error('Production profile domain must use HTTPS.')
  if (!Array.isArray(value.map?.center) || value.map.center.length !== 2 || value.map.center.some((entry) => !Number.isFinite(entry))) throw new Error('Map center must contain latitude and longitude.')
  if (!/^[a-z0-9-]+$/.test(value.city.slug)) throw new Error('City slug must contain lowercase latin letters, digits and hyphens only.')
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
