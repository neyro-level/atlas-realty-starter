import type { CatalogQuery, CatalogSnapshot, ListingCard } from "@/lib/catalog";
import { applyFallbackFilters, buildCategories } from "@/lib/catalog";
import { tenant } from "@/project/tenant";

export const DEFAULT_CONSTRUCTION_PROJECT_IMAGE = "/images/construction-project-default.jpg";

const GENERATED_AT = "2026-07-24T17:40:00+03:00";

type TemporaryConstructionProject = {
  number: number;
  area: number;
  price: number;
  rooms: number;
  floors: number;
  buildTime: string;
  segment: string;
};

// TODO(feed-construction): remove this temporary fallback after XML starts sending real construction projects.
const TEMPORARY_CONSTRUCTION_PROJECTS: TemporaryConstructionProject[] = [
  { number: 122, area: 83, price: 4_648_000, rooms: 2, floors: 1, buildTime: "4 месяца", segment: "бюджет" },
  { number: 117, area: 92, price: 5_152_000, rooms: 3, floors: 1, buildTime: "4 месяца", segment: "бюджет" },
  { number: 114, area: 85, price: 4_760_000, rooms: 2, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
  { number: 111, area: 82, price: 4_592_000, rooms: 3, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
  { number: 110, area: 77, price: 4_312_000, rooms: 3, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
  { number: 109, area: 71, price: 3_976_000, rooms: 3, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
  { number: 107, area: 71, price: 4_615_000, rooms: 3, floors: 1, buildTime: "4 месяца", segment: "заказной" },
  { number: 104, area: 99, price: 5_544_000, rooms: 3, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
  { number: 103, area: 108, price: 6_048_000, rooms: 3, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
  { number: 101, area: 102, price: 5_712_000, rooms: 3, floors: 1, buildTime: "3 месяца", segment: "бюджет" },
];

export const temporaryConstructionListings: ListingCard[] = TEMPORARY_CONSTRUCTION_PROJECTS.map((project) => {
  const slugNumber = String(project.number).padStart(3, "0");
  const images = [1, 2, 3].map((imageNumber) => (
    `/images/construction-projects/project-${project.number}-${imageNumber}.jpg`
  ));

  return {
    id: `temporary-construction-project-${slugNumber}`,
    slug: `temporary-construction-project-${slugNumber}`,
    title: `Проект дома ${project.area} м²`,
    category: "строительство",
    categoryKey: "construction",
    dealType: "sale",
    status: "active",
    isPublished: true,
    price: project.price,
    address: tenant.cityRu,
    city: tenant.cityRu,
    citySlug: tenant.cityEn,
    rooms: project.rooms,
    isStudio: false,
    area: project.area,
    areaLiving: null,
    areaKitchen: null,
    floor: null,
    floorsTotal: project.floors,
    builtYear: null,
    buildingType: project.segment === "заказной" ? "Заказной проект" : "Типовой проект",
    renovation: null,
    lotAreaSotka: null,
    landUseType: null,
    district: null,
    districtSlug: null,
    agentId: null,
    agentName: "Эксперт агентства недвижимости",
    agentPhotoUrl: null,
    image: images[0] ?? DEFAULT_CONSTRUCTION_PROJECT_IMAGE,
    images,
    updatedAt: "временная карточка",
    lastModified: GENERATED_AT,
    lastSeenAt: GENERATED_AT,
    objectCode: null,
    description: [
      `${project.floors}-этажный проект, ${project.rooms} комнаты.`,
      `Ориентировочный срок строительства: ${project.buildTime}.`,
      "Стоимость указана от и уточняется после выбора комплектации и участка.",
    ].join(" "),
    h1: null,
    seoTitle: null,
    seoDescription: null,
    isFeatured: false,
    isPromoted: false,
  };
});

export function applyTemporaryConstructionFallback(
  catalog: CatalogSnapshot,
  query: CatalogQuery,
): CatalogSnapshot {
  if (query.category !== "construction" || catalog.total > 0 || catalog.listings.length > 0) {
    return catalog;
  }

  return applyFallbackFilters(createTemporaryConstructionSnapshot(query), query);
}

export function findTemporaryConstructionListingBySlug(slug: string) {
  return temporaryConstructionListings.find((listing) => listing.slug === slug) ?? null;
}

function createTemporaryConstructionSnapshot(query: CatalogQuery): CatalogSnapshot {
  return {
    generatedAt: GENERATED_AT,
    total: temporaryConstructionListings.length,
    categories: buildCategories(undefined, temporaryConstructionListings),
    facets: {
      cities: [{ label: tenant.cityRu, value: tenant.cityEn, count: temporaryConstructionListings.length }],
      districts: [],
      rooms: [
        { value: 2, count: temporaryConstructionListings.filter((listing) => listing.rooms === 2).length },
        { value: 3, count: temporaryConstructionListings.filter((listing) => listing.rooms === 3).length },
      ],
      price: {
        min: Math.min(...temporaryConstructionListings.map((listing) => listing.price ?? 0).filter(Boolean)),
        max: Math.max(...temporaryConstructionListings.map((listing) => listing.price ?? 0).filter(Boolean)),
      },
      buildingTypes: [
        { label: "Типовой проект", value: "Типовой проект", count: temporaryConstructionListings.filter((listing) => listing.buildingType === "Типовой проект").length },
        { label: "Заказной проект", value: "Заказной проект", count: temporaryConstructionListings.filter((listing) => listing.buildingType === "Заказной проект").length },
      ],
      renovations: [],
      landUseTypes: [],
      commercialTypes: [],
      commercialBuildingTypes: [],
      entranceTypes: [],
    },
    listings: temporaryConstructionListings,
    source: "fallback",
    appliedQuery: query,
  };
}
