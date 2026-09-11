import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildNewBuildingQuickSelectionModel } from "@/components/catalog/new-building-quick-selections-model";
import { getCatalogFaqItems } from "@/components/marketing/catalog-faq-registry";
import { NEW_BUILDING_DETAIL_TEMPLATE_SECTIONS } from "@/modules/new-buildings/template";

describe("new-building conversion flow", () => {
  it("builds all quick actions and toggles between map and list", () => {
    const actions = buildNewBuildingQuickSelectionModel("/novostroyki", {}, 4, 20);
    expect(actions.map((item) => item.title)).toEqual(["До 6 млн ₽", "На карте", "Проверить ипотеку", "Подобрать с экспертом"]);
    expect(actions[0].href).toContain("price_to=6000000");
    expect(buildNewBuildingQuickSelectionModel("/novostroyki", { view: "map" }, 4, 20)[1]).toMatchObject({ title: "К списку", active: true });
  });

  it("publishes the new-building FAQ family for its real route", () => {
    expect(getCatalogFaqItems("novostroyki")).toHaveLength(5);
    expect(getCatalogFaqItems("novostroy")).toBeNull();
  });

  it("keeps the shared detail template order and responsive variants explicit", () => {
    const source = readFileSync(resolve("src/modules/new-buildings/ui/NewBuildingPage.tsx"), "utf8");
    const galleryBlock = source.slice(source.indexOf('case "gallery"'), source.indexOf('case "about"'));
    const aboutBlock = source.slice(source.indexOf('case "about"'), source.indexOf('case "purchaseTerms"'));
    expect(NEW_BUILDING_DETAIL_TEMPLATE_SECTIONS).toEqual(["gallery", "about", "purchaseTerms", "selectionBanner", "location", "related"]);
    expect(galleryBlock).toContain("NewBuildingMobileCommercialSection");
    expect(aboutBlock).toContain("NewBuildingLocationSection");
    expect(source).toContain('className="hidden lg:block"');
    expect(source).toContain('className="lg:hidden"');
  });
});
