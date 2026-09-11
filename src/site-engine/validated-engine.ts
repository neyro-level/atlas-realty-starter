import type { SiteEngine } from "@starter/site-contracts";
import {
  CatalogPageDtoSchema,
  CatalogQueryDtoSchema,
  NewBuildingDtoSchema,
  PropertyCardDtoSchema,
  PropertyDetailDtoSchema,
} from "@starter/site-contracts";

export function withValidatedSiteEngine(engine: SiteEngine): SiteEngine {
  return {
    ...engine,
    async getCatalog(query = {}) {
      const safeQuery = CatalogQueryDtoSchema.parse(query);
      return CatalogPageDtoSchema.parse(await engine.getCatalog(safeQuery));
    },
    async getProperty(slug) {
      const result = await engine.getProperty(slug);
      return result === null ? null : PropertyDetailDtoSchema.parse(result);
    },
    async getNewBuildings() {
      return NewBuildingDtoSchema.array().parse(await engine.getNewBuildings());
    },
    async getNewBuildingCards() {
      return PropertyCardDtoSchema.array().parse(await engine.getNewBuildingCards());
    },
  };
}
