import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const rootConfig = JSON.parse(await readFile("components.json", "utf8"));
const packageConfig = JSON.parse(await readFile("packages/site-ui/components.json", "utf8"));
const comparedFields = ["style", "rsc", "tsx", "iconLibrary"];
const errors = [];

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
const radixImport = /from\s+["']@radix-ui\//;

for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized.endsWith("payload-types.ts")) continue;
  const source = await readFile(file, "utf8");
  if (normalized !== themePath && rawHex.test(source)) errors.push(`raw color outside theme: ${normalized}`);
  if (!normalized.includes("/components/ui/") && radixImport.test(source)) {
    errors.push(`direct Radix import outside shadcn primitives: ${normalized}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`UI system guard passed for ${files.length} source files.`);
