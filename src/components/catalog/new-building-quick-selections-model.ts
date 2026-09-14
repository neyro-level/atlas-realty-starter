import { buildSearchParams, type CatalogQuery } from "@/lib/catalog";
import { tenant } from "@/project/tenant.config";

export function buildNewBuildingQuickSelectionModel(basePath: string, query: CatalogQuery, affordableCount: number, total: number) {
  const mapActive = query.view === "map";
  return [
    {
      id: "affordable",
      title: "До 6 млн ₽",
      description: `${affordableCount} ЖК в бюджете`,
      href: catalogHref(basePath, query, { priceTo: 6_000_000, sort: "price_asc", view: "list" }),
      active: query.priceTo === 6_000_000,
    },
    {
      id: "map",
      title: mapActive ? "К списку" : "На карте",
      description: mapActive ? "Вернуться к витрине" : `${total} ЖК ${tenant.cityRuGenitive}`,
      href: catalogHref(basePath, query, { view: mapActive ? "list" : "map" }),
      active: mapActive,
    },
    {
      id: "mortgage",
      title: "Проверить ипотеку",
      description: "Сравним условия банков",
      source: "catalog:novostroyki:quick:mortgage",
      formType: "new_building_mortgage_consultation",
    },
    {
      id: "expert",
      title: "Подобрать с экспертом",
      description: "Подбор бесплатный",
      source: "catalog:novostroyki:quick:expert",
      formType: "new_building_catalog_selection",
    },
  ] as const;
}

function catalogHref(basePath: string, query: CatalogQuery, updates: Partial<CatalogQuery>) {
  const next = { ...query, ...updates, category: "new_building", limit: query.limit ?? 20 };
  delete next.page;
  const params = buildSearchParams(next);
  return `${basePath}?${params.toString()}`;
}
