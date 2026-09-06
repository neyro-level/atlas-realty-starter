import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const outputRoot = path.resolve(".atlas-import/yandex");
const mediaRoot = path.join(outputRoot, "media");
const collectedAt = new Date().toISOString();

const complexUrls = [
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/dogma-park-3013191/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/mikrorajon-samolyot-2036558/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/leto-3115452/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/fontany-255994/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/park-pobedy-3-4879133/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/rekord-325898/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/park-pobedy-2-3220074/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/grejd-4209194/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/ridz-4144146/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/kvartal-samolyot-7-4131000/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/opera-233063/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/kvartal-6-2248782/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/tyoplye-kraya-3206614/",
  "https://realty.yandex.ru/krasnodarskiy_kray/kupit/novostrojka/rodnye-prostory-1924515/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/pervoe-mesto-3784260/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/ryadom-4884064/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/arhitektor-3315020/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/dom-101-4171147/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/repin-park-3813239/",
  "https://realty.yandex.ru/krasnodar/kupit/novostrojka/patriki-3181597/",
];

const secondarySearches = [
  { rooms: 1, url: "https://realty.yandex.ru/krasnodar/kupit/kvartira/odnokomnatnaya/vtorichniy-rynok/" },
  { rooms: 2, url: "https://realty.yandex.ru/krasnodar/kupit/kvartira/dvuhkomnatnaya/vtorichniy-rynok/" },
  { rooms: 3, url: "https://realty.yandex.ru/krasnodar/kupit/kvartira/tryohkomnatnaya/vtorichniy-rynok/" },
];

await mkdir(mediaRoot, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ locale: "ru-RU", reducedMotion: "reduce" });
const page = await context.newPage();
page.setDefaultTimeout(45_000);

try {
  const complexes = [];
  for (const [index, url] of complexUrls.entries()) {
    console.log(`[complex ${index + 1}/${complexUrls.length}] ${url}`);
    const snapshot = await scrapeDetailPage(page, url);
    const product = snapshot.jsonLd.find((item) => item?.["@type"] === "Product") ?? {};
    const sourceId = url.match(/-(\d+)\/$/)?.[1] ?? hash(url).slice(0, 12);
    const rawName = cleanName(snapshot.h1 || product.name || `Жилой комплекс ${index + 1}`);
    const name = rawName.replace(/\s+[0-5](?:[.,]\d)?$/, "").trim();
    const developer = cleanDeveloper(product.brand?.name ?? bodyValue(snapshot.text, "О застройщике") ?? "Застройщик уточняется");
    const address = extractAddress(product.description, snapshot.text) ?? "Краснодар, адрес уточняется";
    const description = section(snapshot.text, "О жилом комплексе", "Расположение, транспортная доступность") || cleanDescription(product.description, name);
    const photos = selectImages(snapshot.images, name, 12);
    const layouts = selectLayoutImages(snapshot.images, 6);
    const media = await downloadMediaSet({ kind: "complex", slug: slugify(`${name}-${sourceId}`), photos, layouts });
    complexes.push({
      type: "residential-complex",
      order: index + 1,
      slug: slugify(name),
      name,
      developer,
      address,
      district: extractDistrict(address),
      latitude: null,
      longitude: null,
      needsCoordinateReview: true,
      readiness: "construction",
      completion: bodyValue(snapshot.text, "Срок сдачи"),
      classLabel: bodyValue(snapshot.text, "Класс жилья"),
      buildingType: bodyValue(snapshot.text, "Тип дома"),
      floorsLabel: bodyValue(snapshot.text, "Этажность"),
      ceilingHeightLabel: bodyValue(snapshot.text, "Высота потолков"),
      priceFrom: Number(product.offers?.lowPrice ?? product.offers?.price ?? 0) || extractFirstPrice(snapshot.text),
      description: sanitizePublicText(description),
      photos: media.photos,
      layouts: media.layouts,
      provenance: { source: "partner-yandex-realty", externalId: sourceId, technicalUrl: url, collectedAt },
    });
    await page.waitForTimeout(650);
  }

  const properties = [];
  for (const search of secondarySearches) {
    await page.goto(search.url, { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor({ state: "visible" });
    await page.waitForTimeout(2_000);
    const offerUrls = await page.evaluate(() => {
      const seen = new Set();
      return [...document.querySelectorAll('a[href*="/offer/"]')]
        .map((anchor) => anchor.href)
        .filter((url) => /\/offer\/\d+\/?$/.test(url) && !seen.has(url) && seen.add(url))
        .slice(0, 24);
    });
    if (offerUrls.length < 10) throw new Error(`Expected at least 10 offers for ${search.rooms} rooms, received ${offerUrls.length}`);

    let accepted = 0;
    for (const [index, url] of offerUrls.entries()) {
      if (accepted === 10) break;
      console.log(`[property ${search.rooms} rooms candidate ${index + 1}/${offerUrls.length}] ${url}`);
      try {
        const snapshot = await scrapeDetailPage(page, url);
        const product = snapshot.jsonLd.find((item) => item?.["@type"] === "Product") ?? {};
        const externalId = url.match(/\/offer\/(\d+)/)?.[1] ?? hash(url).slice(0, 12);
        const parsed = parseProperty(snapshot, product, search.rooms);
        const photos = selectImages(snapshot.images, parsed.title, 10, "/get-realty-offers/");
        if (photos.length < 3 || !parsed.area || !parsed.price || parsed.address.includes("уточняется")) {
          throw new Error("incomplete public card");
        }
        const media = await downloadMediaSet({ kind: "property", slug: externalId, photos, layouts: [] });
        properties.push({
          type: "property",
          order: properties.length + 1,
          slug: `krasnodar-${search.rooms}k-${externalId}`,
          externalId,
          rooms: search.rooms,
          ...parsed,
          photos: media.photos,
          needsCoordinateReview: true,
          latitude: null,
          longitude: null,
          provenance: { source: "partner-yandex-realty", externalId, technicalUrl: url, collectedAt },
        });
        accepted += 1;
      } catch (error) {
        console.warn(`[skip ${search.rooms} rooms] ${error instanceof Error ? error.message : String(error)}`);
      }
      await page.waitForTimeout(650);
    }
    if (accepted !== 10) throw new Error(`Expected 10 complete offers for ${search.rooms} rooms, received ${accepted}`);
  }

  const catalog = { schemaVersion: 1, city: "Краснодар", collectedAt, complexes, properties };
  catalog.checksum = hash(JSON.stringify(catalog));
  await writeFile(path.join(outputRoot, "catalog.json"), JSON.stringify(catalog, null, 2));
  await writeFile(path.join(outputRoot, "media-manifest.json"), JSON.stringify(buildMediaManifest(catalog), null, 2));
  await writeFile(path.join(outputRoot, "CATALOG.md"), renderCatalog(catalog));
  console.log(`Saved ${complexes.length} complexes and ${properties.length} properties to ${outputRoot}`);
} finally {
  await context.close();
  await browser.close();
}

async function scrapeDetailPage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.locator("main").waitFor({ state: "visible" });
  await page.waitForTimeout(1_500);
  await page.evaluate(async () => {
    for (const position of [0.25, 0.5, 0.75, 1]) {
      window.scrollTo(0, document.body.scrollHeight * position);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    window.scrollTo(0, 0);
  });
  return page.evaluate(() => {
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((node) => {
      try { const value = JSON.parse(node.textContent || "null"); return Array.isArray(value) ? value : [value]; } catch { return []; }
    });
    return {
      h1: document.querySelector("h1")?.textContent?.trim() ?? "",
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      text: document.body.innerText,
      jsonLd,
      images: [...document.images].map((image) => ({ src: image.currentSrc || image.src, alt: image.alt, width: image.naturalWidth, height: image.naturalHeight })),
    };
  });
}

function parseProperty(snapshot, product, rooms) {
  const area = numberFrom(snapshot.h1.match(/([\d.,]+)\s*м²/)?.[1]) || numberFrom(product.description?.match(/([\d.,]+)\s*м²/)?.[1]);
  const floorMatch = snapshot.title.match(/(\d+)\s*этаж из\s*(\d+)/);
  const price = Number(product.offers?.price ?? 0) || extractFirstPrice(snapshot.text);
  const address = extractAddress(product.description, snapshot.text) ?? "Краснодар, адрес уточняется";
  const description = section(snapshot.text, "Описание", "20 МЛН") || snapshot.metaDescription;
  return {
    title: area ? `${rooms}-комнатная квартира, ${formatArea(area)} м²` : `${rooms}-комнатная квартира`,
    address,
    district: extractDistrict(address),
    price,
    area,
    livingArea: numberBeforeLabel(snapshot.text, "жилая"),
    kitchenArea: numberBeforeLabel(snapshot.text, "кухня"),
    floor: Number(floorMatch?.[1] ?? 0) || null,
    floorsTotal: Number(floorMatch?.[2] ?? 0) || null,
    ceilingHeight: numberBeforeLabel(snapshot.text, "потолки"),
    builtYear: Number(snapshot.text.match(/(19|20)\d{2}\s*год\nгод постройки/)?.[0]?.slice(0, 4) ?? 0) || null,
    buildingType: snapshot.text.match(/\n(Кирпичное|Монолитное|Панельное|Кирпично-монолитное) здание/i)?.[1] ?? null,
    renovation: snapshot.text.match(/Отделка\s*[—-]\s*([^\n]+)/)?.[1]?.trim() ?? null,
    description: sanitizePublicText(description),
  };
}

async function downloadMediaSet({ kind, slug, photos, layouts }) {
  const directory = path.join(mediaRoot, kind, slug);
  await mkdir(directory, { recursive: true });
  return {
    photos: await downloadGroup(directory, "photo", photos),
    layouts: await downloadGroup(directory, "layout", layouts),
  };
}

async function downloadGroup(directory, prefix, items) {
  const result = [];
  for (const [index, item] of items.entries()) {
    const filename = `${prefix}-${String(index + 1).padStart(2, "0")}.webp`;
    const filePath = path.join(directory, filename);
    let bytes;
    try { bytes = await readFile(filePath); }
    catch {
      const response = await fetch(item.src, { headers: { Referer: "https://realty.yandex.ru/", "User-Agent": "Mozilla/5.0 AtlasPartnerImporter/1.0" } });
      if (!response.ok) throw new Error(`Media download failed: ${response.status}`);
      const original = Buffer.from(await response.arrayBuffer());
      bytes = await sharp(original).rotate().resize({ width: 1800, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      await writeFile(filePath, bytes);
    }
    result.push({ path: path.relative(outputRoot, filePath).replaceAll("\\", "/"), alt: item.alt, width: item.width, height: item.height, checksum: hash(bytes) });
  }
  return result;
}

function selectImages(images, name, limit, requiredPath = "/get-verba/") {
  const seen = new Set();
  const nameWords = normalize(name).split(" ").filter((word) => word.length > 3);
  return images.filter((image) => {
    const src = image.src.replace(/^\/\//, "https://");
    if (!src.includes("avatars.mds.yandex.net") || !src.includes(requiredPath) || image.width < 650 || image.height < 400) return false;
    if (requiredPath === "/get-verba/" && nameWords.length && !nameWords.some((word) => normalize(image.alt).includes(word))) return false;
    const identity = src.replace(/\/(?:realty_[^/?]+|app_[^/?]+|large)(?:\?.*)?$/, "");
    if (seen.has(identity)) return false;
    seen.add(identity);
    image.src = src;
    return true;
  }).slice(0, limit);
}

function selectLayoutImages(images, limit) {
  return images.filter((image) => /планир|схема/i.test(image.alt) && image.width >= 500 && image.height >= 400).slice(0, limit);
}

function extractAddress(description = "", text = "") {
  return description.match(/Адрес:\s*([^,]+(?:,[^,]+){1,5}),\s*[✅Х]/u)?.[1]?.trim()
    ?? description.match(/по адресу:\s*([^.]*)\.\s*Описание/u)?.[1]?.trim()
    ?? text.match(/\n(Краснодар[^\n]{5,160})\n/)?.[1]?.trim();
}

function extractDistrict(address) {
  return address.match(/(?:жилой массив|микрорайон|мкр\.?|жилой район)\s+([^,]+)/i)?.[1]?.trim() ?? null;
}

function bodyValue(text, label) {
  return text.match(new RegExp(`${escapeRegex(label)}\\n([^\\n]+)`))?.[1]?.trim() ?? null;
}

function section(text, start, end) {
  const from = text.indexOf(start);
  if (from < 0) return "";
  const contentStart = from + start.length;
  const to = text.indexOf(end, contentStart);
  return text.slice(contentStart, to < 0 ? contentStart + 1_800 : to).trim().slice(0, 1_800);
}

function cleanDescription(value = "", name = "") {
  return value.replace(/^✅\s*/u, "").replace(new RegExp(`^${escapeRegex(name)}\\s*[—-]\\s*`, "i"), "");
}

function sanitizePublicText(value = "") {
  return value
    .replace(/https?:\/\/\S+/gu, "")
    .replace(/(?:на\s+)?Яндекс(?:\.Недвижимости|\s+Недвижимости|\.Картах|\s+Картах)?/giu, "")
    .replace(/(?:источник|актуальн(?:о|ость)|обновлено|получено)\s*:?[^.\n]*/giu, "")
    .replace(/(?:id|ID|номер объекта)\s*:?\s*\d+/gu, "")
    .replace(/\+7[\d\s()×xX-]{7,}/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanName(value) { return value.replace(/\s+/g, " ").trim(); }
function cleanDeveloper(value) { return cleanName(String(value).replace(/^Застройщик\s+/i, "")); }
function extractFirstPrice(text) { return Number((text.match(/\n([\d\s]{5,})\s*₽\n/)?.[1] ?? "").replace(/\s/g, "")) || 0; }
function numberBeforeLabel(text, label) { return numberFrom(text.match(new RegExp(`([\\d,.]+)\\s*м²?\\n${escapeRegex(label)}`, "i"))?.[1]); }
function numberFrom(value) { return Number(String(value ?? "").replace(",", ".").replace(/[^\d.]/g, "")) || null; }
function formatArea(value) { return value ? String(value).replace(".", ",") : "площадь уточняется"; }
function normalize(value) { return String(value).toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/giu, " ").trim(); }
function slugify(value) { return normalize(value).replace(/\s+/g, "-").slice(0, 90) || hash(value).slice(0, 12); }
function hash(value) { return createHash("sha256").update(value).digest("hex"); }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function buildMediaManifest(catalog) {
  return {
    schemaVersion: catalog.schemaVersion,
    checksum: catalog.checksum,
    files: [...catalog.complexes, ...catalog.properties].flatMap((item) => [...item.photos, ...(item.layouts ?? [])].map((media) => ({ ownerType: item.type, ownerSlug: item.slug, ...media }))),
  };
}

function renderCatalog(catalog) {
  const lines = ["# Закрытый каталог импорта Atlas", "", `Собрано: ${catalog.collectedAt}`, `Checksum: ${catalog.checksum}`, "", "## 20 жилых комплексов", ""];
  for (const item of catalog.complexes) lines.push(`${item.order}. ${item.name} — ${item.developer}; фото: ${item.photos.length}; планировки: ${item.layouts.length}.`);
  lines.push("", "## 30 квартир вторичного рынка", "");
  for (const item of catalog.properties) lines.push(`${item.order}. ${item.title} — ${item.address}; фото: ${item.photos.length}.`);
  lines.push("", "Технические URL и внешние ID хранятся только в закрытом JSON-manifest и не передаются в публичный DTO.", "");
  return lines.join("\n");
}
