import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("realty UI domain boundaries", () => {
  it("keeps internal property and catalog views independent from starter contracts", () => {
    const files = [
      "packages/site-ui/src/views/property/PropertyCardView.tsx",
      "packages/site-ui/src/views/property/PropertyDetailSectionsView.tsx",
      "packages/site-ui/src/views/catalog/CatalogControlsView.tsx",
    ];
    for (const file of files) expect(readFileSync(file, "utf8")).not.toContain("@starter/site-contracts");
  });

  it("exposes catalog, map and property views from the internal entrypoint", () => {
    const entrypoint = readFileSync("packages/site-ui/src/index.tsx", "utf8");
    for (const item of ["CatalogMapFrameView", "CatalogShowcaseView", "PropertyCardView"]) {
      expect(entrypoint).toContain(item);
    }
    expect(entrypoint).not.toContain("PropertyDetailPageView");
  });

  it("keeps Payload ownership outside presentation packages", () => {
    const files = [
      "packages/site-ui/src/index.tsx",
      "packages/site-ui/src/views/property/PropertyCardView.tsx",
      "src/components/property/PropertyDetailPageView.tsx",
      "packages/site-ui/src/views/catalog/CatalogControlsView.tsx",
      "packages/site-ui/src/views/catalog/CatalogMapFrameView.tsx",
    ];
    for (const file of files) expect(readFileSync(file, "utf8")).not.toMatch(/from ["'][^"']*(payload|postgres|database)/i);
  });
});
