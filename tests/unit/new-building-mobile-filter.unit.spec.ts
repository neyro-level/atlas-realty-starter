import { describe, expect, it } from "vitest";
import { createMobileFilterDraft, resolveMobileApplyTarget } from "@/components/catalog/catalog-mobile-filter-model";

describe("new-building mobile filter", () => {
  it("preserves price bounds and list view for the new-building catalog", () => {
    const result = resolveMobileApplyTarget({
      ...createMobileFilterDraft({ priceFrom: 4_000_000, priceTo: 6_000_000, view: "list" }, "new_building"),
      types: ["new_building"],
      view: "list",
    });

    expect(result).toMatchObject({
      path: "/novostroyki",
      query: { category: "new_building", priceFrom: 4_000_000, priceTo: 6_000_000, view: "list" },
    });
  });
});
