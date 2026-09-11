import { z } from "zod";

import type {
  CatalogPageDto,
  CatalogQueryDto,
  NewBuildingDto,
  PropertyCardDto,
  PropertyDetailDto,
} from "./index";

export const PropertyCategorySchema = z.enum([
  "flat",
  "house",
  "land",
  "commercial",
  "construction",
  "garage",
  "room",
  "other",
]);

const nullableNumber = z.number().nullable();
const optionalNullableNumber = nullableNumber.optional();
const optionalNullableString = z.string().nullable().optional();

const propertyCardShape = {
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  categoryKey: PropertyCategorySchema,
  dealType: z.enum(["sale", "rent"]).optional(),
  origin: z.enum(["XML", "MANUAL"]).nullable().optional(),
  status: z.string().optional(),
  isPublished: z.boolean().optional(),
  price: nullableNumber,
  address: z.string(),
  city: z.string().nullable(),
  citySlug: z.string().nullable(),
  rooms: nullableNumber,
  isStudio: z.boolean().optional(),
  area: nullableNumber,
  areaLiving: optionalNullableNumber,
  areaKitchen: optionalNullableNumber,
  floor: nullableNumber,
  floorsTotal: nullableNumber,
  builtYear: optionalNullableNumber,
  buildingType: optionalNullableString,
  renovation: optionalNullableString,
  houseType: optionalNullableString,
  lotAreaSotka: optionalNullableNumber,
  landCategory: optionalNullableString,
  landUseType: optionalNullableString,
  cadastralNumber: optionalNullableString,
  ceilingHeight: optionalNullableNumber,
  hasHeating: z.boolean().nullable().optional(),
  commercialType: optionalNullableString,
  commercialBuildingType: optionalNullableString,
  entranceType: optionalNullableString,
  district: z.string().nullable(),
  districtSlug: z.string().nullable(),
  agentId: z.string().nullable(),
  agentName: z.string().nullable(),
  agentPhotoUrl: optionalNullableString,
  image: z.string().nullable(),
  images: z.array(z.string()),
  layoutImageUrl: optionalNullableString,
  videoUrl: optionalNullableString,
  videoUrls: z.array(z.string()).optional(),
  updatedAt: z.string(),
  lastModified: optionalNullableString,
  lastSeenAt: optionalNullableString,
  unpublishedAt: optionalNullableString,
  objectCode: optionalNullableString,
  description: optionalNullableString,
  h1: optionalNullableString,
  seoTitle: optionalNullableString,
  seoDescription: optionalNullableString,
  isFeatured: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
};

export const PropertyCardDtoSchema = z.object(propertyCardShape).strict() satisfies z.ZodType<PropertyCardDto>;

export const PropertyDetailDtoSchema = z.object({
  ...propertyCardShape,
  description: z.string(),
  features: z.array(z.object({ label: z.string(), value: z.string() }).strict()),
}).strict() satisfies z.ZodType<PropertyDetailDto>;

export const NewBuildingDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  address: z.string(),
  priceFrom: nullableNumber,
  completion: z.string(),
  image: z.string().nullable(),
  developerName: z.string().optional(),
  floorsLabel: z.string().nullable().optional(),
}).strict() satisfies z.ZodType<NewBuildingDto>;

export const CatalogQueryDtoSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  category: z.string().optional(),
  dealType: z.enum(["sale", "rent"]).optional(),
  rooms: z.union([z.number(), z.array(z.number())]).optional(),
  studio: z.boolean().optional(),
  exclusive: z.boolean().optional(),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  areaFrom: z.number().optional(),
  areaTo: z.number().optional(),
  kitchenFrom: z.number().optional(),
  floorFrom: z.number().optional(),
  floorTo: z.number().optional(),
  lotAreaFrom: z.number().optional(),
  lotAreaTo: z.number().optional(),
  buildingType: z.string().optional(),
  renovation: z.string().optional(),
  landUseType: z.string().optional(),
  hasElectricity: z.boolean().optional(),
  hasGas: z.boolean().optional(),
  hasWater: z.boolean().optional(),
  hasSewerage: z.boolean().optional(),
  commercialType: z.string().optional(),
  commercialBuildingType: z.string().optional(),
  entranceType: z.string().optional(),
  sort: z.enum(["recommended", "newest", "price_asc", "price_desc", "area_desc"]).optional(),
  view: z.enum(["grid", "list", "map"]).optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
}).strict() satisfies z.ZodType<CatalogQueryDto>;

export const CatalogPageDtoSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(PropertyCardDtoSchema),
  query: CatalogQueryDtoSchema,
}).strict() satisfies z.ZodType<CatalogPageDto>;
