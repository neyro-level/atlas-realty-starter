import { aura } from "./content/aura";
import { centralniy } from "./content/centralniy";
import { druzhba } from "./content/druzhba";
import { dubrava } from "./content/dubrava";
import { renovacia } from "./content/renovacia";
import { sibirskayasimfoniya } from "./content/sibirskayasimfoniya";
import { severnyKvartal } from "./content/severny-kvartal";
import { trilistnik } from "./content/trilistnik";
import { vozrohdenie } from "./content/vozrohdenie";
import { zkcity } from "./content/zk-city";
import type { NewBuilding } from "./schema";

export const newBuildings: NewBuilding[] = [
  centralniy,
  aura,
  sibirskayasimfoniya,
  severnyKvartal,
  vozrohdenie,
  zkcity,
  renovacia,
  trilistnik,
  druzhba,
  dubrava,
];

export const SALES_LEADER_NEW_BUILDING_SLUGS = [
  "centralniy",
  "aura",
  "sibirskayasimfoniya",
] as const;

const salesLeaderSlugSet = new Set<string>(SALES_LEADER_NEW_BUILDING_SLUGS);

export function isSalesLeaderNewBuilding(slug: string) {
  return salesLeaderSlugSet.has(slug);
}

export function validateNewBuildingsRegistry() {
  const slugSet = new Set<string>();

  for (const complex of newBuildings) {
    if (slugSet.has(complex.slug)) {
      throw new Error(`Дублирующий slug ЖК: ${complex.slug}`);
    }
    slugSet.add(complex.slug);
  }

  for (const complex of newBuildings) {
    for (const relatedSlug of complex.relatedSlugs) {
      if (!slugSet.has(relatedSlug)) {
        throw new Error(`ЖК ${complex.slug} ссылается на неизвестный relatedSlug: ${relatedSlug}`);
      }
    }
  }

  return newBuildings;
}

validateNewBuildingsRegistry();

export const publishedNewBuildings = newBuildings.filter((complex) => complex.status === "published");
export const newBuildingSlugs = publishedNewBuildings.map((complex) => complex.slug);

const publishedNewBuildingMap = new Map(publishedNewBuildings.map((complex) => [complex.slug, complex]));

export function getNewBuilding(slug: string) {
  return publishedNewBuildingMap.get(slug) ?? null;
}

export function getRelatedNewBuildings(complex: NewBuilding) {
  return complex.relatedSlugs
    .map((slug) => publishedNewBuildingMap.get(slug))
    .filter((item): item is NewBuilding => Boolean(item));
}
