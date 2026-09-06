import type { ListingCard, ListingCategoryKey } from "@/lib/catalog";
import { isNewBuildingListingId } from "@/modules/new-buildings";
import { getPropertyPath } from "@/project/site-config";
import { tenant } from "@/project/tenant";
import type { SessionListingItem } from "./types";

const LISTING_CATEGORY_KEYS = new Set<ListingCategoryKey>([
  "flat",
  "house",
  "land",
  "commercial",
  "construction",
  "garage",
  "room",
  "other",
]);

export function toSessionListingItem(listing: ListingCard, title: string, pathOverride?: string): SessionListingItem {
  const images = normalizeImages(listing.images, listing.image);
  const isNewBuilding = isNewBuildingListingId(listing.id);

  return {
    id: listing.id,
    slug: listing.slug,
    path: pathOverride ?? (isNewBuilding ? `/${listing.slug}` : getPropertyPath(listing.slug)),
    title,
    price: listing.price,
    address: listing.address,
    category: listing.category,
    categoryKey: isNewBuilding ? "new_building" : listing.categoryKey,
    rooms: listing.rooms,
    area: listing.area,
    areaLiving: listing.areaLiving ?? null,
    areaKitchen: listing.areaKitchen ?? null,
    floor: listing.floor,
    floorsTotal: listing.floorsTotal,
    builtYear: listing.builtYear ?? null,
    buildingType: listing.buildingType ?? null,
    renovation: listing.renovation ?? null,
    image: listing.image ?? images[0] ?? null,
    images,
    objectCode: listing.objectCode ?? null,
    isExclusive: Boolean(listing.isExclusive),
  };
}

/** Rebuild a ListingCard for catalog card chrome (gallery / exclusive / phone). */
export function toListingCardFromSession(item: SessionListingItem): ListingCard {
  const images = normalizeImages(item.images, item.image);

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    categoryKey: toListingCategoryKey(item.categoryKey),
    price: item.price,
    address: item.address,
    city: tenant.cityRu,
    citySlug: tenant.cityEn,
    rooms: item.rooms,
    area: item.area,
    areaLiving: item.areaLiving ?? null,
    areaKitchen: item.areaKitchen ?? null,
    floor: item.floor,
    floorsTotal: item.floorsTotal,
    builtYear: item.builtYear ?? null,
    buildingType: item.buildingType ?? null,
    renovation: item.renovation ?? null,
    district: null,
    districtSlug: null,
    agentId: null,
    agentName: null,
    image: item.image ?? images[0] ?? null,
    images,
    updatedAt: "",
    objectCode: item.objectCode ?? null,
    isExclusive: Boolean(item.isExclusive),
  };
}

export function normalizeSessionListingItem(item: SessionListingItem): SessionListingItem {
  const images = normalizeImages(item.images, item.image);
  return {
    ...item,
    image: item.image ?? images[0] ?? null,
    images,
    isExclusive: Boolean(item.isExclusive),
  };
}

function normalizeImages(images: string[] | undefined, cover: string | null | undefined) {
  const fromList = Array.isArray(images) ? images.filter(Boolean) : [];
  if (fromList.length) return [...new Set(fromList)];
  return cover ? [cover] : [];
}

function toListingCategoryKey(value: string): ListingCategoryKey {
  if (LISTING_CATEGORY_KEYS.has(value as ListingCategoryKey)) {
    return value as ListingCategoryKey;
  }
  return "other";
}
