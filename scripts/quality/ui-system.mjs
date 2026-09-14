import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { extname, join } from "node:path";

const rootConfig = JSON.parse(await readFile("components.json", "utf8"));
const packageConfig = JSON.parse(await readFile("packages/site-ui/components.json", "utf8"));
const migrationBaseline = JSON.parse(await readFile("scripts/quality/ui-debt-baseline.json", "utf8"));
const comparedFields = ["style", "rsc", "tsx", "iconLibrary"];
const errors = [];
const debt = {
  paletteTokens: 0,
  rawColorsOutsideTheme: 0,
  arbitraryShadows: 0,
  nativeControlsOutsidePrimitives: 0,
  componentNumberedTokens: 0,
  arbitraryTypography: 0,
  arbitraryLayout: 0,
  unstyled: 0,
  inputCheckbox: 0,
  spaceUtilities: 0,
  manualButtonIconSize: 0,
  sharedProjectAssets: 0,
  sharedBusinessClaims: 0,
};
const debtCeilings = {
  paletteTokens: 0,
  rawColorsOutsideTheme: 0,
  arbitraryShadows: 0,
  nativeControlsOutsidePrimitives: 0,
  ...migrationBaseline,
};

for (const field of comparedFields) {
  if (rootConfig[field] !== packageConfig[field]) errors.push(`components.json mismatch: ${field}`);
}
if (rootConfig.tailwind?.baseColor !== packageConfig.tailwind?.baseColor) {
  errors.push("components.json mismatch: tailwind.baseColor");
}
if (rootConfig.registries || packageConfig.registries) {
  errors.push("custom UI registries are not part of the Atlas component architecture");
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
const arbitraryShadow = /shadow-\[(?!var\()[^\]]+\]/g;
const nativeControl = /<(?:button|input|textarea|select)\b/g;
const legacyOverlayBridge = /data-(?:request-modal|modal-open)|open-(?:request-modal|property-chat)/;
const identityLeak = /(?:АТЛАС|Краснодар|atlas-(?!media))/i;
const componentNumberedToken = /var\(--[a-z0-9-]+-(?:color|surface|content|border|shadow|effect|icon)-[0-9]{2}\)/g;
const arbitraryTypography = /\btext-\[(?![^\]]*var\()[^\]]+\]/g;
const arbitraryLayout = /\b(?:m[trblxy]?|p[trblxy]?|gap|space-[xy]|w|h|min-[wh]|max-[wh]|rounded)-\[(?![^\]]*var\()[^\]]+\]/g;
const arbitraryTypographyUses = new Map();
const arbitraryLayoutUses = new Map();
const unstyled = /\bunstyled\b/g;
const inputCheckbox = /<Input\b[^>]{0,400}type=["']checkbox["']/gs;
const spaceUtility = /\bspace-[xy]-[a-z0-9.\[\]-]+/g;
const projectAsset = /["']\/images\/[^"']+["']/g;
const businessClaim = /(?:бесплат|гарант|перезвонит\s+в\s+течение\s+\d+\s+минут|рейтинг\s*[:=]?\s*["']?\d[.,]\d)/gi;
const hardcodedWhiteBackground = /\bbg-white\b/g;
const buttonBlock = /<(?:Button|RequestModalButton)\b[\s\S]{0,900}?<\/(?:Button|RequestModalButton)>/g;
const manuallySizedIcon = /<[A-Z][A-Za-z0-9]*\b[^>]*className=["'][^"']*\bsize-/;
const rootPackageImport = /(?:from\s+|import\s*\(\s*)["']@starter\/site-ui["']/;
const activatesDarkMode = /(?:className\s*=\s*["'](?:dark(?:\s|["'])|[^"']+\sdark(?:\s|["']))|classList\.(?:add|toggle)\(\s*["']dark["'])/;

for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized.endsWith("payload-types.ts")) continue;
  const source = await readFile(file, "utf8");
  if (activatesDarkMode.test(source)) errors.push(`light-only project must not activate .dark: ${normalized}`);
  if ((normalized.startsWith("packages/site-ui/src/") || normalized.startsWith("src/components/")) && hardcodedWhiteBackground.test(source)) {
    errors.push(`hardcoded white background outside theme: ${normalized}`);
  }
  hardcodedWhiteBackground.lastIndex = 0;
  if (normalized.startsWith("packages/site-ui/src/views/") && /(?:PageView|LandingView)\.tsx$/.test(normalized)) {
    errors.push(`whole-page composition inside shared UI: ${normalized}`);
  }
  if (normalized === "packages/site-ui/src/index.tsx" && /export\s+(?:async\s+)?(?:function|const|class)\b/.test(source)) {
    errors.push("site-ui root barrel must contain re-exports only");
  }
  if (normalized !== "packages/site-ui/src/index.tsx" && rootPackageImport.test(source)) {
    errors.push(`site-ui consumer must use an explicit subpath: ${normalized}`);
  }
  if (normalized.startsWith("packages/site-ui/src/views/") && source.split(/\r?\n/).length > 300) {
    errors.push(`shared UI view exceeds 300 lines: ${normalized}`);
  }
  if (normalized.startsWith("src/components/ui/")) errors.push(`duplicate UI primitive outside site-ui package: ${normalized}`);
  if (normalized !== themePath && rawHex.test(source)) errors.push(`raw color outside theme: ${normalized}`);
  if (normalized !== themePath) debt.rawColorsOutsideTheme += source.match(rawColor)?.length ?? 0;
  debt.paletteTokens += source.match(paletteToken)?.length ?? 0;
  debt.arbitraryShadows += source.match(arbitraryShadow)?.length ?? 0;
  debt.componentNumberedTokens += source.match(componentNumberedToken)?.length ?? 0;
  for (const match of source.matchAll(arbitraryTypography)) arbitraryTypographyUses.set(match[0], (arbitraryTypographyUses.get(match[0]) ?? 0) + 1);
  for (const match of source.matchAll(arbitraryLayout)) arbitraryLayoutUses.set(match[0], (arbitraryLayoutUses.get(match[0]) ?? 0) + 1);
  debt.unstyled += source.match(unstyled)?.length ?? 0;
  debt.inputCheckbox += source.match(inputCheckbox)?.length ?? 0;
  debt.spaceUtilities += source.match(spaceUtility)?.length ?? 0;
  if (normalized.startsWith("packages/site-ui/src/")) debt.sharedProjectAssets += source.match(projectAsset)?.length ?? 0;
  if (normalized.startsWith("packages/site-ui/src/")) debt.sharedBusinessClaims += source.match(businessClaim)?.length ?? 0;
  for (const match of source.matchAll(buttonBlock)) {
    const body = match[0].slice(match[0].indexOf(">") + 1);
    if (manuallySizedIcon.test(body)) debt.manualButtonIconSize += 1;
  }
  if (!normalized.includes("/components/ui/")) debt.nativeControlsOutsidePrimitives += source.match(nativeControl)?.length ?? 0;
  if (!normalized.includes("/components/ui/") && radixImport.test(source)) {
    errors.push(`direct Radix import outside shadcn primitives: ${normalized}`);
  }
  if (legacyOverlayBridge.test(source)) errors.push(`legacy overlay event bridge: ${normalized}`);
  if (normalized.endsWith("/page.tsx") && source.split(/\r?\n/).length > 600) {
    errors.push(`page composition exceeds 600 lines: ${normalized}`);
  } else if (
    (normalized.endsWith("/LeadgenPromoLandingView.tsx") ||
      normalized.endsWith("/PropertyCardView.tsx") ||
      normalized.endsWith("/CatalogSharpShowcase.tsx")) &&
    source.split(/\r?\n/).length > 600
  ) {
    errors.push(`page composition exceeds 600 lines: ${normalized}`);
  }
  if (normalized.startsWith("packages/site-ui/src/") && identityLeak.test(source)) {
    errors.push(`client identity inside neutral shared UI: ${normalized}`);
  }
}

for (const [alias, value] of Object.entries(rootConfig.aliases ?? {})) {
  if ((alias === "components" || alias === "ui" || alias === "lib" || alias === "hooks") && !String(value).startsWith("@starter/site-ui/")) {
    errors.push(`root shadcn alias must target site-ui package: ${alias}`);
  }
}

debt.arbitraryTypography = repeatedDebt(arbitraryTypographyUses);
debt.arbitraryLayout = repeatedDebt(arbitraryLayoutUses);

if (process.argv.includes("--self-test")) {
  const fixture = '<Input type="checkbox" /><Button unstyled><Star className="size-4" /></Button><div className="space-y-4 text-[13px] max-w-[760px]">var(--demo-color-01)</div><img src="/images/project.webp" /><p>Гарантия, консультация бесплатно</p>';
  const detected = [inputCheckbox, unstyled, spaceUtility, arbitraryTypography, arbitraryLayout, componentNumberedToken].every((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(fixture);
  });
  if (!detected || !manuallySizedIcon.test(fixture) || !projectAsset.test(fixture) || !businessClaim.test(fixture)) {
    errors.push("UI guard self-test failed to detect intentional debt");
  }
}

for (const [name, count] of Object.entries(debt)) {
  if (!(name in debtCeilings)) errors.push(`UI debt ceiling is missing: ${name}`);
  else if (count > debtCeilings[name]) errors.push(`UI debt regression: ${name}=${count}, ceiling=${debtCeilings[name]}`);
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

function repeatedDebt(uses) {
  return [...uses.values()].reduce((total, count) => total + Math.max(0, count - 1), 0);
}
