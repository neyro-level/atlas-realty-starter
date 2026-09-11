import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("realty UI domain boundaries", () => {
  it("keeps Registry property and catalog views independent from starter contracts", () => {
    const files = [
      "packages/site-ui/src/views/PropertyCardView.tsx",
      "packages/site-ui/src/views/PropertyDetailSectionsView.tsx",
      "packages/site-ui/src/views/CatalogControlsView.tsx",
      "packages/site-ui/src/views/CatalogMobileFilterView.tsx",
    ];
    for (const file of files) expect(readFileSync(file, "utf8")).not.toContain("@starter/site-contracts");
  });

  it("installs catalog, map and property umbrella items", () => {
    const registry = readFileSync("packages/site-ui/registry.json", "utf8");
    for (const item of ["ams-realty-catalog", "ams-realty-catalog-map", "ams-realty-property", "ams-realty-property-detail"]) {
      expect(registry).toContain(`"name": "${item}"`);
    }
  });

  it("keeps Payload ownership outside presentation packages", () => {
    const registry = readFileSync("packages/site-ui/registry.json", "utf8");
    expect(registry).not.toMatch(/payload|postgres|database/i);
  });
});
