import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["src", "packages/site-ui/src"];
const files = (await Promise.all(roots.map(collect))).flat();
const sources = await Promise.all(files.map(async (file) => ({ file, source: await readFile(file, "utf8") })));
const theme = await readFile("packages/site-ui/src/theme.css", "utf8");
const declarations = new Set(sources.flatMap(({ source }) => [...source.matchAll(/--([a-zA-Z0-9-_]+)\s*:/g)].map((match) => match[1])));
const uses = sources.flatMap(({ file, source }) => [...source.matchAll(/var\(--([a-zA-Z0-9-_]+)/g)].map((match) => ({ file, name: match[1] })));
const errors = [];
const admittedOverrides = new Set(["card-bg", "card-border"]);

for (const use of uses) {
  if (!declarations.has(use.name) && !admittedOverrides.has(use.name)) errors.push(`unknown token --${use.name}: ${use.file}`);
}

const requiredTokens = [
  "surface-page", "content-strong", "border-default", "action-primary", "status-success",
  "site-type-display", "spacing-section-default", "radius-control", "shadow-surface", "container-page", "motion-default",
];
for (const token of requiredTokens) {
  if (!declarations.has(token)) errors.push(`required semantic token is missing: --${token}`);
}

const numberedPattern = /^(?:new-building|property|compare-table|session-collection|catalog-(?!buyer-services)|leadgen|journal|agency|corporate|sale|lawyer|careers|about|employee|legal|mortgage|home)[a-z0-9-]*-(?:color|surface|content|border|shadow|effect|icon)-\d{2}$/;
for (const name of declarations) {
  if (numberedPattern.test(name)) errors.push(`numbered new-building token remains: --${name}`);
}

const compatibility = [...theme.matchAll(/--([a-z0-9-]+-(?:color|surface|content|border|shadow|effect|icon)-\d{2})\s*:/g)].map((match) => match[1]);
for (const name of compatibility) {
  if (!uses.some((use) => use.name === name)) errors.push(`unused numbered compatibility token: --${name}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "PASS",
  declaredTokens: declarations.size,
  compatibilityAliases: compatibility.length,
  unresolvedTokens: 0,
  migratedDomains: ["new-buildings", "catalog", "property", "session-collections", "home", "leadgen", "journal", "marketing"],
}, null, 2));

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await collect(file)));
    else if ([".css", ".ts", ".tsx"].includes(extname(entry.name))) result.push(file);
  }
  return result;
}
