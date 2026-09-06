import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["packages/site-ui/src", "src"];
const extensions = new Set([".css", ".ts", ".tsx"]);
const themePath = "packages/site-ui/src/theme.css";
const generatedStart = "  /* Generated exact-value palette: application code must use these tokens. */";
const generatedEnd = "  /* End generated exact-value palette. */";
const canonical = new Map(
  Object.entries({
    "#101011": "surface-dark-strong",
    "#17161a": "text-primary",
    "#18181a": "surface-dark",
    "#413f41": "text-secondary",
    "#630e0e": "accent-hover",
    "#827f81": "text-muted",
    "#8a1515": "accent",
    "#9e1c1c": "error",
    "#d0d0cd": "input",
    "#e3e3e1": "border",
    "#ebebe9": "surface-muted",
    "#f4f4f3": "background",
    "#f7f2f2": "accent-soft",
    "#fafafa": "surface-card-soft",
    "#ffffff": "surface",
    "#fff": "surface",
  }),
);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else if (extensions.has(extname(entry.name)) && !path.endsWith("payload-types.ts")) files.push(path);
  }
  return files;
}

const files = (await Promise.all(roots.map(collectFiles)))
  .flat()
  .filter((path) => path.replaceAll("\\", "/") !== themePath);
const discovered = new Set();
const hexPattern = /#[0-9a-fA-F]{6}(?![0-9a-fA-F])|#[0-9a-fA-F]{3}(?![0-9a-fA-F])/g;
const paletteReferencePattern = /var\(--palette-([0-9a-fA-F]{6})\)/g;

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(hexPattern)) discovered.add(match[0].toLowerCase());
  for (const match of source.matchAll(paletteReferencePattern)) discovered.add(`#${match[1].toLowerCase()}`);
}

const tokenFor = (hex) => canonical.get(hex) ?? `palette-${hex.slice(1)}`;
const palette = [...discovered]
  .filter((hex) => !canonical.has(hex))
  .sort()
  .map((hex) => `  --palette-${hex.slice(1)}: ${hex};`)
  .join("\n");

let theme = await readFile(themePath, "utf8");
const existingStart = theme.indexOf(generatedStart);
if (existingStart >= 0) {
  const existingEnd = theme.indexOf(generatedEnd, existingStart);
  theme = `${theme.slice(0, existingStart)}${theme.slice(existingEnd + generatedEnd.length + 1)}`;
}
theme = theme.replace("\n}\n\n@theme inline", `\n${generatedStart}\n${palette}\n${generatedEnd}\n}\n\n@theme inline`);
await writeFile(themePath, theme);

for (const file of files) {
  const source = await readFile(file, "utf8");
  const normalized = source.replace(hexPattern, (value) => `var(--${tokenFor(value.toLowerCase())})`);
  if (normalized !== source) await writeFile(file, normalized);
}

console.log(`Normalized ${discovered.size} exact colors across ${files.length} UI source files.`);
