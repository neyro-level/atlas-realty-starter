import type { ListingCard } from "@/lib/catalog";
import { tenant } from "@/project/tenant.config";
import type { NewBuilding } from "./schema";
import { resolveNewBuildingMedia } from "./format";

export const NEW_BUILDING_LISTING_ID_PREFIX = "new-building:";

export function isNewBuildingListingId(id: string) {
  return id.startsWith(NEW_BUILDING_LISTING_ID_PREFIX);
}

export function newBuildingToListingCard(complex: NewBuilding): ListingCard {
  const images = [complex.media.hero, ...complex.media.gallery]
    .map(resolveNewBuildingMedia)
    .map((entry) => entry.src)
    .filter((src): src is string => Boolean(src));
  const uniqueImages = [...new Set(images)];
  const address = cleanComplexAddress(complex.location.address ?? complex.location.city);
  const title = formatComplexName(complex.shortName ?? complex.name);

  return {
    id: `${NEW_BUILDING_LISTING_ID_PREFIX}${complex.slug}`,
    slug: complex.slug,
    title,
    category: "Новостройки",
    categoryKey: "other",
    dealType: "sale",
    status: "active",
    isPublished: complex.status === "published",
    price: complex.facts.priceFrom,
    address,
    city: complex.location.city || tenant.cityRu,
    citySlug: tenant.cityEn,
    rooms: null,
    isStudio: false,
    area: complex.facts.areaFrom,
    areaLiving: null,
    areaKitchen: null,
    floor: null,
    floorsTotal: null,
    builtYear: null,
    buildingType: null,
    renovation: null,
    lotAreaSotka: null,
    landUseType: null,
    district: complex.location.district,
    districtSlug: null,
    agentId: null,
    agentName: null,
    agentPhotoUrl: null,
    image: uniqueImages[0] ?? null,
    images: uniqueImages,
    updatedAt: complex.updatedAt,
    lastModified: complex.updatedAt,
    lastSeenAt: complex.updatedAt,
    objectCode: null,
    description: complex.positioning,
    h1: complex.seo.h1,
    isExclusive: false,
  };
}

export function newBuildingHref(complex: Pick<NewBuilding, "slug"> | { slug: string }) {
  return `/${complex.slug}`;
}

function formatComplexName(name: string) {
  return name.replace(/^ЖК\s+/u, "").replace(/[«»]/gu, "").trim();
}

function cleanComplexAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const withoutRegion = parts.filter((part) => {
    const normalized = part.toLowerCase().replace(/\./g, "");
    return (
      normalized !== "россия" &&
      normalized !== "рф" &&
      normalized !== "российская федерация" &&
      normalized !== "городская народная республика"
    );
  });

  return withoutRegion.join(", ") || address;
}
