import { existsSync, readFileSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const value = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const root = resolve(value('--root', '.'))
const mode = value('--mode', 'source')
if (!['source', 'export'].includes(mode)) throw new Error(`Unknown audit mode: ${mode}`)

const manifestPath = join(root, 'starter.manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const git = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  cwd: root,
  encoding: 'utf8',
})
let files
let inventorySource
if (git.status === 0) {
  files = git.stdout.split('\0').filter(Boolean).map(normalize)
  inventorySource = 'git'
} else {
  const inventoryPath = join(root, '.starter-inventory.json')
  if (!existsSync(inventoryPath)) {
    console.log(JSON.stringify({ mode, root, status: 'NOT_RUN', reason: 'Git inventory unavailable and .starter-inventory.json is missing' }, null, 2))
    process.exit(2)
  }
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'))
  files = inventory.files.map(normalize)
  const missing = files.filter((path) => !existsSync(join(root, path)))
  if (missing.length) {
    console.log(JSON.stringify({ mode, root, status: 'NOT_RUN', reason: 'Starter inventory references missing files', missing: missing.slice(0, 100) }, null, 2))
    process.exit(2)
  }
  inventorySource = 'starter-inventory'
}
const compiledRules = manifest.classifications.map((rule) => ({
  ...rule,
  patterns: rule.patterns.map((pattern) => ({ negative: pattern.startsWith('!'), regex: globToRegExp(pattern.replace(/^!/, '')) })),
}))

function classify(path) {
  for (const rule of compiledRules) {
    const positives = rule.patterns.filter((pattern) => !pattern.negative)
    const negatives = rule.patterns.filter((pattern) => pattern.negative)
    if (positives.some((pattern) => pattern.regex.test(path)) && !negatives.some((pattern) => pattern.regex.test(path))) {
      return rule.name
    }
  }
  return manifest.defaultClassification
}

const classified = files.map((path) => ({ classification: classify(path), path }))
const unclassified = classified.filter((item) => item.classification === manifest.defaultClassification)
const presentationViolations = []
const markerViolations = []
const markerFindings = []
const textExtensions = new Set(['', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.scss', '.ts', '.tsx', '.txt', '.yaml', '.yml'])

for (const item of classified) {
  const absolute = join(root, item.path)
  if (!textExtensions.has(extname(item.path).toLowerCase())) continue
  let content
  try {
    content = readFileSync(absolute, 'utf8')
  } catch {
    continue
  }
  if (content.includes('\0')) continue

  const inPresentation = manifest.audit.presentationRoots.some((directory) => item.path === directory || item.path.startsWith(`${directory}/`))
  if (inPresentation) {
    for (const forbiddenImport of manifest.audit.forbiddenPresentationImports) {
      if (content.includes(forbiddenImport)) presentationViolations.push({ import: forbiddenImport, path: item.path })
    }
  }

  if (!manifest.audit.markerAllowedPaths.includes(item.path)) {
    for (const marker of manifest.audit.clientMarkers) {
      if (!content.toLocaleLowerCase('ru').includes(marker.toLocaleLowerCase('ru'))) continue
      const finding = { classification: item.classification, marker, path: item.path }
      markerFindings.push(finding)
      if (mode === 'export') markerViolations.push(finding)
      if (mode === 'source' && inPresentation) markerViolations.push(finding)
    }
  }
}

const counts = Object.fromEntries(
  [...new Set(classified.map((item) => item.classification))]
    .sort()
    .map((name) => [name, classified.filter((item) => item.classification === name).length]),
)

const failed = Boolean(unclassified.length || presentationViolations.length || markerViolations.length)

console.log(JSON.stringify({
  status: failed ? 'FAIL' : 'PASS',
  inventorySource,
  mode,
  root,
  files: files.length,
  classifications: counts,
  clientMarkerFindings: markerFindings.length,
  unclassified: unclassified.slice(0, 100),
  presentationViolations,
  markerViolations: markerViolations.slice(0, 100),
}, null, 2))

if (failed) process.exit(1)


function normalize(path) {
  return path.split(sep).join('/')
}

function globToRegExp(pattern) {
  let source = ''
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index]
    if (character === '*') {
      if (pattern[index + 1] === '*') {
        source += '.*'
        index += 1
      } else {
        source += '[^/]*'
      }
      continue
    }
    if (character === '?') {
      source += '[^/]'
      continue
    }
    source += character.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
  }
  return new RegExp(`^${source}$`)
}
