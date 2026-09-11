import { describe, expect, it } from "vitest";

import {
  CatalogPageDtoSchema,
  NewBuildingDtoSchema,
  PropertyCardDtoSchema,
  PropertyDetailDtoSchema,
} from "@starter/site-contracts";
import {
  fixtureNewBuildings,
  fixtureProperties,
  fixturePropertyDetails,
} from "@starter/site-fixtures";

describe("public runtime DTO contracts", () => {
  it("accepts the current fixture catalog and detail records", () => {
    expect(PropertyCardDtoSchema.array().parse(fixtureProperties)).toHaveLength(fixtureProperties.length);
    expect(PropertyDetailDtoSchema.array().parse(fixturePropertyDetails)).toHaveLength(fixturePropertyDetails.length);
    expect(NewBuildingDtoSchema.array().parse(fixtureNewBuildings)).toHaveLength(fixtureNewBuildings.length);
    expect(CatalogPageDtoSchema.parse({ total: fixtureProperties.length, items: fixtureProperties, query: {} }).total)
      .toBe(fixtureProperties.length);
  });

  it("rejects malformed records before they reach presentation code", () => {
    const malformed = { ...fixtureProperties[0], price: "5000000" };
    expect(PropertyCardDtoSchema.safeParse(malformed).success).toBe(false);
  });
});
