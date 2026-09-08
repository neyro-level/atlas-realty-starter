import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const outputRoot = path.resolve(".atlas-import/yandex");
const mediaRoot = path.join(outputRoot, "media");
const collectedAt = new Date().toISOString();
const propertiesOnly = process.env.ATLAS_SCRAPE_PROPERTIES_ONLY === "YES";
const roomFilter = Number(process.env.ATLAS_SCRAPE_ROOMS ?? 0) || null;
const categoryFilter = new Set((process.env.ATLAS_SCRAPE_CATEGORIES ?? "").split(",").map((value) => value.trim()).filter(Boolean));

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
  { category: "apartment", rooms: 1, url: "https://realty.yandex.ru/krasnodar/kupit/kvartira/odnokomnatnaya/vtorichniy-rynok/" },
  { category: "apartment", rooms: 2, url: "https://realty.yandex.ru/krasnodar/kupit/kvartira/dvuhkomnatnaya/vtorichniy-rynok/" },
  { category: "apartment", rooms: 3, url: "https://realty.yandex.ru/krasnodar/kupit/kvartira/tryohkomnatnaya/vtorichniy-rynok/" },
  { category: "house", rooms: null, url: "https://realty.yandex.ru/krasnodar/kupit/dom/" },
  { category: "land", rooms: null, url: "https://realty.yandex.ru/krasnodar/kupit/uchastok/" },
  { category: "commercial", rooms: null, url: "https://realty.yandex.ru/krasnodar/kupit/kommercheskaya-nedvizhimost/" },
];

await mkdir(mediaRoot, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ locale: "ru-RU", reducedMotion: "reduce" });
const page = await context.newPage();
page.setDefaultTimeout(45_000);

try {
  let previousCatalog = null;
  const complexes = [];
  if (propertiesOnly) {
    previousCatalog = JSON.parse(await readFile(path.join(outputRoot, "catalog.json"), "utf8"));
    complexes.push(...previousCatalog.complexes.map((item) => ({ ...item, name: cleanComplexName(item.name), slug: slugify(cleanComplexName(item.name)) })));
  }
  for (const [index, url] of (propertiesOnly ? [] : complexUrls).entries()) {
    console.log(`[complex ${index + 1}/${complexUrls.length}] ${url}`);
    const snapshot = await scrapeDetailPage(page, url);
    const product = snapshot.jsonLd.find((item) => item?.["@type"] === "Product") ?? {};
    const sourceId = url.match(/-(\d+)\/$/)?.[1] ?? hash(url).slice(0, 12);
    const rawName = cleanComplexName(snapshot.h1 || product.name || `Жилой комплекс ${index + 1}`);
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

  const selectedSearches = secondarySearches.filter((item) =>
    (!categoryFilter.size || categoryFilter.has(item.category)) && (!roomFilter || item.rooms === roomFilter));
  const selectedKeys = new Set(selectedSearches.map((item) => `${item.category}:${item.rooms ?? "all"}`));
  const properties = previousCatalog
    ? previousCatalog.properties
      .map((item) => ({ ...item, category: item.category ?? "apartment", rooms: item.rooms ?? null }))
      .filter((item) => !selectedKeys.has(`${item.category}:${item.category === "apartment" ? item.rooms : "all"}`))
    : [];
  const usedPropertyAddresses = new Set(properties.map((item) => normalize(item.address)));
  const usedPropertyPhotoChecksums = new Set(properties.flatMap((item) => item.photos.map((photo) => photo.checksum)));
  for (const search of selectedSearches) {
    const offers = await collectOffers(page, search.url, 5);
    if (offers.length < 10) throw new Error(`Expected at least 10 offers for ${search.category}, received ${offers.length}`);

    let accepted = 0;
    for (const [index, offer] of offers.entries()) {
      if (accepted === 10) break;
      const { url, photos } = offer;
      console.log(`[property ${search.category} candidate ${index + 1}/${offers.length}] ${url}`);
      try {
        const snapshot = await scrapeDetailPage(page, url);
        const product = snapshot.jsonLd.find((item) => item?.["@type"] === "Product") ?? {};
        const externalId = url.match(/\/offer\/(\d+)/)?.[1] ?? hash(url).slice(0, 12);
        const parsed = parseProperty(snapshot, product, search);
        const addressIdentity = normalize(parsed.address);
        if (photos.length < 5 || !parsed.area || !parsed.price || !isKrasnodarAddress(parsed.address) || (search.rooms === 3 && parsed.area < 55)) {
          throw new Error("incomplete public card");
        }
        if (usedPropertyAddresses.has(addressIdentity)) throw new Error("duplicate public address");
        const media = await downloadMediaSet({ kind: "property", slug: externalId, photos, layouts: [] });
        const uniquePhotos = media.photos.filter((photo) => !usedPropertyPhotoChecksums.has(photo.checksum));
        if (uniquePhotos.length < 5) throw new Error("fewer than five unique property photos");
        properties.push({
          type: "property",
          order: properties.length + 1,
          slug: `krasnodar-${search.category}-${externalId}`,
          externalId,
          category: search.category,
          rooms: parsed.rooms,
          ...parsed,
          photos: uniquePhotos,
          needsCoordinateReview: true,
          latitude: null,
          longitude: null,
          provenance: { source: "partner-yandex-realty", externalId, technicalUrl: url, collectedAt },
        });
        usedPropertyAddresses.add(addressIdentity);
        for (const photo of uniquePhotos) usedPropertyPhotoChecksums.add(photo.checksum);
        accepted += 1;
      } catch (error) {
        console.warn(`[skip ${search.category}] ${error instanceof Error ? error.message : String(error)}`);
      }
      await page.waitForTimeout(650);
    }
    if (accepted !== 10) throw new Error(`Expected 10 complete offers for ${search.category}, received ${accepted}`);
  }

  const catalog = { schemaVersion: 1, city: "Краснодар", collectedAt, complexes, properties };
  assertCatalogQuality(catalog);
  catalog.checksum = hash(JSON.stringify(catalog));
  await writeFile(path.join(outputRoot, "catalog.json"), JSON.stringify(catalog, null, 2));
  await writeFile(path.join(outputRoot, "media-manifest.json"), JSON.stringify(buildMediaManifest(catalog), null, 2));
  await writeFile(path.join(outputRoot, "CATALOG.md"), renderCatalog(catalog));
  console.log(`Saved ${complexes.length} complexes and ${properties.length} properties to ${outputRoot}`);
} finally {
  await context.close();
  await browser.close();
}

async function collectOffers(page, searchUrl, maxPages) {
  const seen = new Map();
  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const url = new URL(searchUrl);
    if (pageNumber > 1) url.searchParams.set("page", String(pageNumber));
    await page.goto(url.href, { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor({ state: "visible" });
    await page.waitForTimeout(2_000);
    const pageOffers = await page.evaluate(() => [...document.querySelectorAll("li.OffersSerp__list-item_type_offer")].flatMap((card) => {
      const url = [...card.querySelectorAll('a[href*="/offer/"]')].map((anchor) => anchor.href).find((href) => /\/offer\/\d+\/?$/.test(href));
      if (!url) return [];
      const identities = new Set();
      const photos = [...card.querySelectorAll('img[src*="/get-realty-offers/"]')].flatMap((image) => {
        const raw = image.currentSrc || image.src;
        const identity = raw.replace(/\/(?:app_[^/?]+|realty_[^/?]+|large)(?:\?.*)?$/, "");
        if (identities.has(identity)) return [];
        identities.add(identity);
        return [{ src: `${identity}/app_large`, alt: image.alt, width: image.naturalWidth, height: image.naturalHeight }];
      }).slice(0, 5);
      return [{ url, photos }];
    }));
    for (const offer of pageOffers) {
      if (!seen.has(offer.url) || seen.get(offer.url).photos.length < offer.photos.length) seen.set(offer.url, offer);
    }
  }
  return [...seen.values()];
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

function parseProperty(snapshot, product, search) {
  const lotArea = numberFrom(snapshot.h1.match(/([\d.,]+)\s*сот/i)?.[1]) || numberFrom(snapshot.text.match(/([\d.,]+)\s*сот(?:ки|ок)?\n(?:участок|общая)/i)?.[1]);
  const buildingArea = numberFrom(snapshot.h1.match(/([\d.,]+)\s*м²/)?.[1]) || numberFrom(product.description?.match(/([\d.,]+)\s*м²/)?.[1]);
  const area = search.category === "land" && lotArea ? lotArea * 100 : buildingArea;
  const floorMatch = snapshot.title.match(/(\d+)\s*этаж из\s*(\d+)/);
  const price = Number(product.offers?.price ?? 0) || extractFirstPrice(snapshot.text);
  const address = extractAddress(product.description, snapshot.text) ?? "Краснодар, адрес уточняется";
  const description = extractListingDescription(snapshot.text) || snapshot.metaDescription;
  return {
    title: listingTitle(search, area, lotArea, snapshot.h1),
    address,
    district: extractDistrict(address),
    price,
    area,
    rooms: search.rooms ?? numberFrom(snapshot.text.match(/(\d+)\s*комнат[аы]?\n(?:в\s*)?доме/i)?.[1]),
    lotArea,
    landUseType: snapshot.text.match(/\n([^\n]+)\nтип участка/i)?.[1]?.trim() ?? null,
    commercialType: commercialType(snapshot.h1),
    livingArea: search.category === "apartment" || search.category === "house" ? numberBeforeLabel(snapshot.text, "жилая") : null,
    kitchenArea: search.category === "apartment" || search.category === "house" ? numberBeforeLabel(snapshot.text, "кухня") : null,
    floor: Number(floorMatch?.[1] ?? 0) || null,
    floorsTotal: Number(floorMatch?.[2] ?? 0) || null,
    ceilingHeight: numberBeforeLabel(snapshot.text, "потолки"),
    builtYear: Number(snapshot.text.match(/(19|20)\d{2}\s*год\nгод постройки/)?.[0]?.slice(0, 4) ?? 0) || null,
    buildingType: snapshot.text.match(/\n(Кирпичное|Монолитное|Панельное|Кирпично-монолитное) здание/i)?.[1] ?? null,
    renovation: snapshot.text.match(/Отделка\s*[—-]\s*([^\n]+)/)?.[1]?.trim() ?? null,
    description: sanitizePublicText(description),
  };
}

function listingTitle(search, area, lotArea, h1) {
  if (search.category === "apartment") return area ? `${search.rooms}-комнатная квартира, ${formatArea(area)} м²` : `${search.rooms}-комнатная квартира`;
  if (search.category === "house") return area ? `Дом, ${formatArea(area)} м²` : "Дом";
  if (search.category === "land") return lotArea ? `Участок, ${formatArea(lotArea)} сот.` : "Земельный участок";
  const kind = h1.replace(/^[\d.,\s\u00a0]+м²\s*,\s*/iu, "").trim();
  return area ? `${sentenceCase(kind || "Коммерческая недвижимость")}, ${formatArea(area)} м²` : sentenceCase(kind || "Коммерческая недвижимость");
}

function commercialType(value) {
  if (/офис/i.test(value)) return "office";
  if (/торгов/i.test(value)) return "retail";
  if (/склад/i.test(value)) return "warehouse";
  if (/готовый бизнес/i.test(value)) return "business";
  return "free_purpose";
}

function isKrasnodarAddress(value) { return /^(?:г\.?\s*)?Краснодар(?:,|$)/iu.test(value); }
function sentenceCase(value) { return value ? value[0].toLocaleUpperCase("ru-RU") + value.slice(1) : value; }

async function downloadMediaSet({ kind, slug, photos, layouts }) {
  const directory = path.join(mediaRoot, kind, slug);
  await mkdir(directory, { recursive: true });
  return {
    photos: await downloadGroup(directory, "photo", photos),
    layouts: await downloadGroup(directory, "layout", layouts),
  };
}

async function downloadGroup(directory, prefix, items) {
  const result = await Promise.all(items.map(async (item, index) => {
    const filename = `${prefix}-${String(index + 1).padStart(2, "0")}.webp`;
    const filePath = path.join(directory, filename);
    try {
      const response = await fetch(item.src, {
        headers: { Referer: "https://realty.yandex.ru/", "User-Agent": "Mozilla/5.0 AtlasPartnerImporter/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const original = Buffer.from(await response.arrayBuffer());
      const bytes = await sharp(original).rotate().resize({ width: 1800, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      await writeFile(filePath, bytes);
      return { path: path.relative(outputRoot, filePath).replaceAll("\\", "/"), alt: item.alt, width: item.width, height: item.height, checksum: hash(bytes) };
    } catch (error) {
      console.warn(`[skip media] ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }));
  return result.filter(Boolean);
}

function selectImages(images, name, limit, requiredPath = "/get-verba/") {
  const seen = new Set();
  const nameWords = normalize(name).split(" ").filter((word) => word.length > 3);
  return images.filter((image) => {
    const src = image.src.replace(/^\/\//, "https://");
    if (!src.includes("avatars.mds.yandex.net") || !src.includes(requiredPath) || image.width < 650 || image.height < 400) return false;
    if (requiredPath === "/get-verba/" && nameWords.length && !nameWords.some((word) => normalize(image.alt).includes(word))) return false;
    if (requiredPath === "/get-realty-offers/" && !normalize(image.alt).startsWith(normalize(name))) return false;
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

function extractListingDescription(text) {
  const matches = [...text.matchAll(/(?:^|\n)Описание\s*\n+([\s\S]*?)(?=\n+\s*Подробнее|\n+20\s*МЛН|$)/giu)];
  return matches.map((match) => match[1]?.trim() ?? "").find((value) => value.length >= 40)?.slice(0, 1_800) ?? "";
}

function cleanDescription(value = "", name = "") {
  return value.replace(/^✅\s*/u, "").replace(new RegExp(`^${escapeRegex(name)}\\s*[—-]\\s*`, "i"), "");
}

function sanitizePublicText(value = "") {
  return value
    .replace(/https?:\/\/\S+/gu, "")
    .replace(/(?:на\s+)?Яндекс(?:\.Недвижимости|\s+Недвижимости|\.Картах|\s+Картах)?/giu, "")
    .replace(/(?:источник|актуальн(?:о|ость)|обновлено|получено)\s*:?[^.\n]*/giu, "")
    .replace(/(?:id|номер объекта)\s*:?\s*\d+/giu, "")
    .replace(/\+7[\d\s()×xX-]{7,}/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanName(value) { return value.replace(/\s+/g, " ").trim(); }
function cleanComplexName(value) {
  return cleanName(value)
    .replace(/\s+Нет оценок$/iu, "")
    .replace(/^микрорайон/iu, "Микрорайон")
    .replace(/^жилой район/iu, "Жилой район")
    .replace(/^клубный квартал/iu, "Клубный квартал")
    .replace(/DОГМА/gu, "Dogma")
    .replace(/DOGMA ПАРК/giu, "Dogma Парк")
    .replace(/ГРЕЙД/gu, "Грейд")
    .replace(/РИДЗ/gu, "Ридз")
    .replace(/САМОЛЁТ 7/gu, "Самолёт 7")
    .replace(/ПЕРВОЕ МЕСТО/gu, "Первое место");
}
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

function assertCatalogQuality(catalog) {
  const roomCounts = new Map([1, 2, 3].map((rooms) => [rooms, 0]));
  const categoryCounts = new Map(["apartment", "house", "land", "commercial"].map((category) => [category, 0]));
  const addresses = new Set();
  const photoOwners = new Map();
  for (const property of catalog.properties) {
    categoryCounts.set(property.category, (categoryCounts.get(property.category) ?? 0) + 1);
    if (property.category === "apartment") roomCounts.set(property.rooms, (roomCounts.get(property.rooms) ?? 0) + 1);
    const address = normalize(property.address);
    if (addresses.has(address)) throw new Error(`Duplicate property address: ${property.address}`);
    addresses.add(address);
    for (const photo of property.photos) {
      const owner = photoOwners.get(photo.checksum);
      if (owner && owner !== property.externalId) throw new Error(`Photo checksum is shared by ${owner} and ${property.externalId}`);
      photoOwners.set(photo.checksum, property.externalId);
    }
  }
  const validCategories = categoryCounts.get("apartment") === 30
    && ["house", "land", "commercial"].every((category) => categoryCounts.get(category) === 10);
  if (catalog.complexes.length !== 20 || catalog.properties.length !== 60 || !validCategories || [1, 2, 3].some((rooms) => roomCounts.get(rooms) !== 10)) {
    throw new Error(`Invalid catalog counts: complexes=${catalog.complexes.length}, properties=${catalog.properties.length}, categories=${JSON.stringify(Object.fromEntries(categoryCounts))}, rooms=${JSON.stringify(Object.fromEntries(roomCounts))}`);
  }
}

function renderCatalog(catalog) {
  const lines = ["# Закрытый каталог импорта Atlas", "", `Собрано: ${catalog.collectedAt}`, `Checksum: ${catalog.checksum}`, "", "## 20 жилых комплексов", ""];
  for (const item of catalog.complexes) lines.push(`${item.order}. ${item.name} — ${item.developer}; фото: ${item.photos.length}; планировки: ${item.layouts.length}.`);
  lines.push("", "## 60 объектов: 30 квартир, 10 домов, 10 участков, 10 коммерческих", "");
  for (const item of catalog.properties) lines.push(`${item.order}. ${item.title} — ${item.address}; фото: ${item.photos.length}.`);
  lines.push("", "Технические URL и внешние ID хранятся только в закрытом JSON-manifest и не передаются в публичный DTO.", "");
  return lines.join("\n");
}
