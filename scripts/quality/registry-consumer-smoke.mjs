import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const registryRoot = path.resolve("public/r");
const entryName = "ams-realty-new-building";
const installedItems = new Map();

async function loadItem(name) {
  if (installedItems.has(name)) return;
  const item = JSON.parse(await readFile(path.join(registryRoot, `${name}.json`), "utf8"));
  installedItems.set(name, item);
  for (const dependency of item.registryDependencies ?? []) await loadItem(dependency);
}

await loadItem(entryName);

const consumerRoot = await mkdtemp(path.join(tmpdir(), "ams-registry-consumer-"));
const installedFiles = new Map();

try {
  for (const item of installedItems.values()) {
    for (const file of item.files ?? []) {
      const relativePath = normalizeRegistryPath(file.path);
      const destination = path.join(consumerRoot, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, file.content, "utf8");
      installedFiles.set(relativePath, file.content);
    }
  }

  const missingImports = [];
  for (const [filePath, content] of installedFiles) {
    for (const specifier of relativeImports(content)) {
      const base = path.posix.normalize(path.posix.join(path.posix.dirname(filePath), specifier));
      const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
      if (!candidates.some((candidate) => installedFiles.has(candidate))) {
        missingImports.push(`${filePath} -> ${specifier}`);
      }
    }
  }

  if (missingImports.length) {
    throw new Error(`Registry consumer is missing relative imports:\n${missingImports.join("\n")}`);
  }

  const domainItems = [
    "ams-realty-new-building-catalog",
    "ams-realty-new-building-detail",
    "ams-realty-new-building-conversion",
  ];
  const forbidden = [/@starter\//, /\/images\//, /АТЛАС/i, /Краснодар/i, />4\.9</];
  for (const name of domainItems) {
    const item = installedItems.get(name);
    for (const file of item.files ?? []) {
      for (const pattern of forbidden) {
        if (pattern.test(file.content)) throw new Error(`${name}:${file.path} contains forbidden project coupling ${pattern}`);
      }
    }
  }

  console.log(`Registry consumer PASS: ${installedItems.size} items, ${installedFiles.size} files`);
} finally {
  await rm(consumerRoot, { recursive: true, force: true });
}

function normalizeRegistryPath(value) {
  return value.replace(/^packages\/site-ui\//, "").replaceAll("\\", "/");
}

function relativeImports(content) {
  const imports = [];
  const pattern = /(?:from\s+|import\s*)["'](\.{1,2}\/[^"']+)["']/g;
  for (const match of content.matchAll(pattern)) imports.push(match[1]);
  return imports;
}
