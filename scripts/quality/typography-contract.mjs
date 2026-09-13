import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'

const roots = ['src', 'packages/site-ui/src']
const baseline = JSON.parse(await readFile('scripts/quality/typography-baseline.json', 'utf8'))
const files = (await Promise.all(roots.map(collect))).flat()
const debt = {
  tailwindTextSize: 0,
  arbitraryTextSize: 0,
  tailwindLeading: 0,
  arbitraryLeading: 0,
  tailwindTracking: 0,
  arbitraryTracking: 0,
  rawCssFontSize: 0,
  rawCssLineHeight: 0,
  rawCssLetterSpacing: 0,
}
const patterns = {
  tailwindTextSize: /\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
  arbitraryTextSize: /\btext-\[(?![^\]]*var\()[^\]]+\]/g,
  tailwindLeading: /\bleading-(?:none|tight|snug|normal|relaxed|loose|[0-9]+)\b/g,
  arbitraryLeading: /\bleading-\[(?![^\]]*var\()[^\]]+\]/g,
  tailwindTracking: /\btracking-(?:tighter|tight|normal|wide|wider|widest)\b/g,
  arbitraryTracking: /\btracking-\[(?![^\]]*var\()[^\]]+\]/g,
  rawCssFontSize: /font-size\s*:\s*(?!var\()[^;}]+/g,
  rawCssLineHeight: /line-height\s*:\s*(?!var\()[^;}]+/g,
  rawCssLetterSpacing: /letter-spacing\s*:\s*(?!var\(|0(?:\s*[;}]))[^;}]+/g,
}

const commercialHeadingFiles = files.filter((file) => {
  const normalized = file.replaceAll('\\', '/')
  return (
    normalized.startsWith('src/components/marketing/') ||
    normalized.startsWith('src/app/(site)/otzyvy/_components/') ||
    /packages\/site-ui\/src\/views\/(?:AboutCompany|Careers|CatalogHero|Contacts|Corporate|EmployeeReviews|Lawyer|LeadgenPromo|Mortgage|Sale|leadgen-promo)/.test(
      normalized,
    )
  )
})
const journalPageTitleFiles = [
  'packages/site-ui/src/views/journal/JournalHubView.tsx',
  'packages/site-ui/src/views/journal/JournalCategoryView.tsx',
  'packages/site-ui/src/views/journal/JournalArticleView.tsx',
]
const forbiddenHeadingSize =
  /\b(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|text-\[(?![^\]]*var\()[^\]]+\]|text-display-(?:small|base|medium|large|extra-large)|text-section-(?:base|large|prominent|wide|expanded)|(?:sm|md|lg|xl|min-\[[^\]]+\]):text-(?:display|section)-(?:small|base|medium|large|extra-large|prominent|wide|expanded))\b/

if (process.argv.includes('--self-test')) {
  const fixture =
    'text-sm text-[13px] leading-tight leading-[1.15] tracking-wide tracking-[0.08em] font-size:13px; line-height:1.2; letter-spacing:.02em;'
  const missing = Object.entries(patterns)
    .filter(([, pattern]) => {
      pattern.lastIndex = 0
      return !pattern.test(fixture)
    })
    .map(([name]) => name)

  if (missing.length) {
    console.error(`typography guard self-test failed: ${missing.join(', ')}`)
    process.exit(1)
  }

  const commercialFixture = '<h2 className="text-display-large leading-tight">Bad section</h2>'
  const journalFixture = '<h1 className="text-display-medium">Bad article title</h1>'
  if (
    !findHeadingViolations('fixture-commercial.tsx', commercialFixture, 'commercial').length ||
    !findHeadingViolations('JournalArticleView.tsx', journalFixture, 'journal').length
  ) {
    console.error('typography guard self-test failed: governed heading bypass was not detected')
    process.exit(1)
  }

  console.log(
    JSON.stringify(
      { status: 'PASS', selfTest: 'typography guard detects non-semantic classes' },
      null,
      2,
    ),
  )
  process.exit(0)
}

for (const file of files) {
  const normalized = file.replaceAll('\\', '/')
  if (normalized.endsWith('payload-types.ts')) continue

  const source = await readFile(file, 'utf8')
  for (const [name, pattern] of Object.entries(patterns)) {
    debt[name] += source.match(pattern)?.length ?? 0
  }
}

const errors = []
for (const file of commercialHeadingFiles) {
  errors.push(...findHeadingViolations(file, await readFile(file, 'utf8'), 'commercial'))
}
for (const file of journalPageTitleFiles) {
  errors.push(...findHeadingViolations(file, await readFile(file, 'utf8'), 'journal'))
}
const articleDocument = 'packages/site-ui/src/views/journal/ArticleDocumentView.tsx'
const articleDocumentSource = await readFile(articleDocument, 'utf8')
if (
  !/<h2\b[^>]*className="[^"]*text-editorial-heading[^"]*leading-editorial-heading[^"]*"/.test(
    articleDocumentSource,
  )
) {
  errors.push(
    `${articleDocument}: article section H2 must use text-editorial-heading leading-editorial-heading`,
  )
}
for (const [name, count] of Object.entries(debt)) {
  const ceiling = baseline[name]
  if (!Number.isInteger(ceiling)) {
    errors.push(`typography baseline is missing: ${name}`)
  } else if (count > ceiling) {
    errors.push(`typography debt regression: ${name}=${count}, ceiling=${ceiling}`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  console.error(
    'Use semantic typography tokens from packages/site-ui/src/theme.css, then lower scripts/quality/typography-baseline.json when debt is removed.',
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      status: 'PASS',
      files: files.length,
      debt,
      baseline,
      policy:
        'Commercial pages use page-title/section-title roles; journal pages use editorial title/heading/body roles.',
    },
    null,
    2,
  ),
)

function findHeadingViolations(file, source, mode) {
  const violations = []
  const headings = source.matchAll(/<h([12])\b[^>]*className=(?:"([^"]*)"|\{`([\s\S]*?)`\})[^>]*>/g)
  for (const match of headings) {
    const level = match[1]
    const classes = match[2] ?? match[3] ?? ''
    if (classes.includes('sr-only')) continue
    if (
      mode === 'journal' &&
      level === '1' &&
      !(classes.includes('text-editorial-title') && classes.includes('leading-editorial-title'))
    ) {
      violations.push(`${file}: journal H1 must use text-editorial-title leading-editorial-title`)
    }
    if (
      mode === 'commercial' &&
      level === '1' &&
      !(classes.includes('text-page-title') && classes.includes('leading-page-title'))
    ) {
      violations.push(`${file}: commercial H1 must use text-page-title leading-page-title`)
    }
    if (mode === 'commercial' && level === '2' && forbiddenHeadingSize.test(classes)) {
      violations.push(`${file}: commercial H2 uses a forbidden page/display/raw size: ${classes}`)
    }
  }
  return violations
}

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const result = []
  for (const entry of entries) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await collect(file)))
    else if (['.css', '.ts', '.tsx'].includes(extname(entry.name))) result.push(file)
  }
  return result
}
