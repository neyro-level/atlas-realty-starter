import { createHash } from 'node:crypto'
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const publicRoot = path.resolve('public')
const sourceRoots = ['src', 'packages', 'tests']
const imageFiles = await walk(path.join(publicRoot, 'images'))
const largePngs = []
for (const file of imageFiles) if (file.endsWith('.png') && (await stat(file)).size > 1_000_000) largePngs.push(file)
const replacements = new Map()

for (const source of largePngs) {
  const target = source.replace(/\.png$/i, '.webp')
  const encoded = await sharp(source).rotate().webp({ quality: 92 }).toBuffer()
  if (encoded.length >= (await stat(source)).size) continue
  await writeFile(target, encoded)
  replacements.set(publicPath(source), publicPath(target))
}

const textFiles = (await Promise.all(sourceRoots.map((root) => walk(path.resolve(root))))).flat()
  .filter((file) => /\.(?:css|js|json|md|mjs|mts|ts|tsx)$/i.test(file))
for (const file of textFiles) {
  const before = await readFile(file, 'utf8')
  let after = before
  for (const [source, target] of replacements) after = after.replaceAll(source, target)
  if (after !== before) await writeFile(file, after)
}

for (const source of replacements.keys()) {
  if (await isReferenced(source, textFiles)) throw new Error(`Refusing to delete referenced image: ${source}`)
  await rm(path.join(publicRoot, source.slice(1)))
}

const webps = (await walk(path.join(publicRoot, 'images'))).filter((file) => file.endsWith('.webp'))
const byHash = new Map()
for (const file of webps) {
  const checksum = createHash('sha256').update(await readFile(file)).digest('hex')
  const group = byHash.get(checksum) ?? []
  group.push(file)
  byHash.set(checksum, group)
}
for (const duplicates of byHash.values()) {
  if (duplicates.length < 2) continue
  const [canonical, ...redundant] = duplicates.sort()
  for (const duplicate of redundant) {
    const duplicatePublicPath = publicPath(duplicate)
    const canonicalPublicPath = publicPath(canonical)
    for (const file of textFiles) {
      const before = await readFile(file, 'utf8')
      const after = before.replaceAll(duplicatePublicPath, canonicalPublicPath)
      if (after !== before) await writeFile(file, after)
    }
    if (await isReferenced(duplicatePublicPath, textFiles)) throw new Error(`Refusing to delete referenced duplicate: ${duplicatePublicPath}`)
    await rm(duplicate)
  }
}

console.log(`Optimized ${replacements.size} static PNG files.`)

async function walk(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await walk(entryPath))
    else result.push(entryPath)
  }
  return result
}

async function isReferenced(needle, files) {
  for (const file of files) if ((await readFile(file, 'utf8')).includes(needle)) return true
  return false
}

function publicPath(file) {
  const relative = path.relative(publicRoot, file)
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Image path escapes public root.')
  return `/${relative.replaceAll('\\', '/')}`
}
