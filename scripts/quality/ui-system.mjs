import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { extname, join } from "node:path";

const rootConfig = JSON.parse(await readFile("components.json", "utf8"));
const packageConfig = JSON.parse(await readFile("packages/site-ui/components.json", "utf8"));
const comparedFields = ["style", "rsc", "tsx", "iconLibrary"];
const errors = [];
const debt = { paletteTokens: 0, rawColorsOutsideTheme: 0, arbitraryShadows: 0, nativeControlsOutsidePrimitives: 0 };
const debtCeilings = {
  paletteTokens: 496,
  rawColorsOutsideTheme: 286,
  arbitraryShadows: 143,
  nativeControlsOutsidePrimitives: 165,
};

for (const field of comparedFields) {
  if (rootConfig[field] !== packageConfig[field]) errors.push(`components.json mismatch: ${field}`);
}
if (rootConfig.tailwind?.baseColor !== packageConfig.tailwind?.baseColor) {
  errors.push("components.json mismatch: tailwind.baseColor");
}

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path)));
    else if ([".css", ".ts", ".tsx"].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

const files = (await Promise.all([collect("packages/site-ui/src"), collect("src")])).flat();
const themePath = "packages/site-ui/src/theme.css";
const rawHex = /#[0-9a-fA-F]{6}(?![0-9a-fA-F])|#[0-9a-fA-F]{3}(?![0-9a-fA-F])/;
const rawColor = /#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\(/g;
const radixImport = /from\s+["']@radix-ui\//;
const paletteToken = /var\(--palette-[a-z0-9-]+\)/g;
const arbitraryShadow = /shadow-\[[^\]]+\]/g;
const nativeControl = /<(?:button|input|textarea|select)\b/g;
const identityLeak = /(?:АТЛАС|Краснодар|atlas-(?!media))/i;

for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized.endsWith("payload-types.ts")) continue;
  const source = await readFile(file, "utf8");
  if (normalized !== themePath && rawHex.test(source)) errors.push(`raw color outside theme: ${normalized}`);
  if (normalized !== themePath) debt.rawColorsOutsideTheme += source.match(rawColor)?.length ?? 0;
  debt.paletteTokens += source.match(paletteToken)?.length ?? 0;
  debt.arbitraryShadows += source.match(arbitraryShadow)?.length ?? 0;
  if (!normalized.includes("/components/ui/")) debt.nativeControlsOutsidePrimitives += source.match(nativeControl)?.length ?? 0;
  if (!normalized.includes("/components/ui/") && radixImport.test(source)) {
    errors.push(`direct Radix import outside shadcn primitives: ${normalized}`);
  }
  if (normalized.startsWith("packages/site-ui/src/") && identityLeak.test(source)) {
    errors.push(`client identity inside neutral shared UI: ${normalized}`);
  }
}

for (const [name, count] of Object.entries(debt)) {
  if (count > debtCeilings[name]) errors.push(`UI debt regression: ${name}=${count}, ceiling=${debtCeilings[name]}`);
}

const registry = JSON.parse(await readFile("packages/site-ui/registry.json", "utf8"));
for (const item of registry.items ?? []) {
  if (!item.name?.startsWith("ams-realty-")) errors.push(`registry item must use ams-realty-* namespace: ${item.name}`);
  if (identityLeak.test(JSON.stringify(item))) errors.push(`client identity inside neutral registry item: ${item.name}`);
}

const publicImages = await collectAll("public/images");
const imageHashes = new Map();
for (const file of publicImages) {
  const bytes = await readFile(file);
  if (bytes.length > 512 * 1024) errors.push(`static image exceeds 512 KiB: ${file.replaceAll("\\", "/")}`);
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const duplicate = imageHashes.get(checksum);
  if (duplicate) errors.push(`duplicate static image: ${duplicate} and ${file.replaceAll("\\", "/")}`);
  else imageHashes.set(checksum, file.replaceAll("\\", "/"));
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`UI system guard passed for ${files.length} source files. Debt ceilings: ${JSON.stringify(debt)}.`);

async function collectAll(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await collectAll(file)));
    else if ((await stat(file)).isFile()) result.push(file);
  }
  return result;
}
