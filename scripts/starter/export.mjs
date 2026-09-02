import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const value = (name) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}
const has = (name) => args.includes(name)
if (!has('--owner-approved')) throw new Error('Starter export requires explicit owner approval: pass --owner-approved only after a new owner command')
const root = resolve('.')
const targetArg = value('--target')
if (!targetArg) throw new Error('Usage: pnpm starter:export --target <empty-directory>')
const target = resolve(targetArg)
if (target === root || target.startsWith(`${root}${sep}`)) throw new Error('Export target must be outside the source repository')

const status = git(['status', '--porcelain'])
if (status.trim() && !has('--allow-dirty')) throw new Error('Source repository must be clean; use --allow-dirty only for local exporter development')
const branch = git(['branch', '--show-current']).trim()
if (branch !== 'main' && !has('--allow-dirty')) throw new Error(`Starter export requires main, got ${branch || 'detached HEAD'}`)
const sha = git(['rev-parse', 'HEAD']).trim()

if (existsSync(target) && readdirSync(target).length > 0) throw new Error(`Export target is not empty: ${target}`)
mkdirSync(target, { recursive: true })

const manifest = JSON.parse(readFileSync(join(root, 'starter.manifest.json'), 'utf8'))
const rules = manifest.classifications.map((rule) => ({
  ...rule,
  patterns: rule.patterns.map((pattern) => ({ negative: pattern.startsWith('!'), regex: globToRegExp(pattern.replace(/^!/, '')) })),
}))
const replacements = JSON.parse(readFileSync(join(root, 'starter', 'neutral', 'replacements.json'), 'utf8'))
const included = new Set(['ADAPTER', 'CLIENT', 'CORE', 'OPS_TEMPLATE', 'REFERENCE_ASSET'])
const textExtensions = new Set(['', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.scss', '.ts', '.tsx', '.txt', '.yaml', '.yml'])
const files = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean).map(normalize)
const copied = []
const skipped = []

for (const path of files) {
  if (!existsSync(join(root, path))) {
    skipped.push({ classification: 'DELETED_WORKTREE', path })
    continue
  }
  if (path.startsWith('starter/neutral/')) continue
  const classification = classify(path)
  if (!included.has(classification)) {
    skipped.push({ classification, path })
    continue
  }
  copy(path, replaceAll(path, replacements.pathReplacements))
}

const neutralRoot = join(root, 'starter', 'neutral')
if (existsSync(neutralRoot)) {
  for (const source of walkFiles(neutralRoot)) {
    if (source.endsWith(`${sep}replacements.json`)) continue
    const destination = normalize(relative(neutralRoot, source))
    mkdirSync(dirname(join(target, destination)), { recursive: true })
    copyFileSync(source, join(target, destination))
    copied.push({ classification: 'NEUTRAL_OVERLAY', path: destination })
  }
}
const targetManifestPath = join(target, 'starter.manifest.json')
const targetManifest = JSON.parse(readFileSync(targetManifestPath, 'utf8'))
targetManifest.sourceProject = manifest.targetTemplate
writeFileSync(targetManifestPath, `${JSON.stringify(targetManifest, null, 2)}\n`)


writeFileSync(join(target, '.starter-source.json'), `${JSON.stringify({
  schemaVersion: 1,
  sourceProject: manifest.sourceProject,
  sourceDirty: Boolean(status.trim()),
  sourceSha: sha,
  exportedAt: new Date().toISOString(),
  copiedFiles: copied.length,
  skippedByClassification: Object.fromEntries([...new Set(skipped.map((item) => item.classification))].sort().map((name) => [name, skipped.filter((item) => item.classification === name).length])),
  requiredClientReplacements: manifest.requiredClientReplacements,
}, null, 2)}\n`)

if (!has('--skip-audit')) {
  const audit = spawnSync(process.execPath, ['scripts/starter/audit.mjs', '--mode', 'export', '--root', target], { cwd: target, encoding: 'utf8', stdio: 'inherit' })
  if (audit.status !== 0) process.exit(audit.status ?? 1)
}

console.log(JSON.stringify({ target, sourceSha: sha, copiedFiles: copied.length, skippedFiles: skipped.length }, null, 2))

function classify(path) {
  for (const rule of rules) {
    const positives = rule.patterns.filter((pattern) => !pattern.negative)
    const negatives = rule.patterns.filter((pattern) => pattern.negative)
    if (positives.some((pattern) => pattern.regex.test(path)) && !negatives.some((pattern) => pattern.regex.test(path))) return rule.name
  }
  return manifest.defaultClassification
}

function copy(sourcePath, destinationPath) {
  const source = join(root, sourcePath)
  if (!statSync(source).isFile()) return
  const destination = join(target, destinationPath)
  mkdirSync(dirname(destination), { recursive: true })
  copyFileSync(source, destination)
  if (textExtensions.has(extname(destinationPath).toLowerCase()) && destinationPath !== 'starter.manifest.json') {
    const content = readFileSync(destination, 'utf8')
    writeFileSync(destination, replaceAll(content, replacements.contentReplacements))
  }
  copied.push({ classification: classify(sourcePath), path: destinationPath })
}

function git(command) {
  const result = spawnSync('git', command, { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || `git ${command.join(' ')} failed`)
  return result.stdout
}

function normalize(path) {
  return path.split(sep).join('/')
}


function replaceAll(value, entries) {
  return entries.reduce((result, [from, to]) => result.split(from).join(to), value)
}
function walkFiles(directory) {
  const files = []
  const pending = [directory]
  while (pending.length) {
    const current = pending.pop()
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) pending.push(path)
      else if (entry.isFile()) files.push(path)
    }
  }
  return files
}

function globToRegExp(pattern) {
  let source = ''
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index]
    if (character === '*') {
      if (pattern[index + 1] === '*') {
        source += '.*'
        index += 1
      } else source += '[^/]*'
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
