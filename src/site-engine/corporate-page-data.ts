import "server-only";
import type { ArticleSummary } from "@/entities/article/model";
import type { CatalogQuery, CatalogSnapshot, ListingCard } from "@/lib/catalog";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import { parseCatalogSearchParams, type CatalogSearchParams } from "@/modules/catalog";
import { isLocalFullCatalogEnabled, LOCAL_FULL_CATALOG_LIMIT } from "@/modules/catalog/fallback-config";
import type { CorporatePageConfig } from "@/project/corporate-pages";
import { getSiteEngine } from "./index";

export type CorporatePageData = {
  visitorQuery: CatalogQuery;
  showcaseLimit: number;
  showcaseQuery: CatalogQuery | null;
  showcase: CatalogSnapshot | null;
  relatedArticles: ArticleSummary[];
  invalidPage: boolean;
};

export async function loadCorporatePageData(page: CorporatePageConfig, searchParams: CatalogSearchParams): Promise<CorporatePageData> {
  const visitorQuery = parseCatalogSearchParams(searchParams);
  const showcaseLimit = page.showcase?.query.limit ?? CATALOG_PAGE_SIZE;
  const showcaseQuery = page.showcase
    ? withLocalFullCatalogQuery({ ...visitorQuery, ...page.showcase.query, limit: showcaseLimit })
    : null;
  const engine = await getSiteEngine();
  const relatedArticleSlugs = page.relatedArticleSlugs ?? [];
  const [showcase, articles] = await Promise.all([
    loadShowcase(page, showcaseQuery),
    relatedArticleSlugs.length ? engine.getArticles() : Promise.resolve([]),
  ]);
  const currentPage = visitorQuery.page ?? 1;
  const totalPages = showcaseQuery && showcase
    ? Math.max(1, Math.ceil(showcase.total / (showcaseQuery.limit ?? CATALOG_PAGE_SIZE)))
    : 1;
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));
  const matched = relatedArticleSlugs.map((slug) => articleBySlug.get(slug)).filter((article): article is ArticleSummary => Boolean(article));

  return {
    visitorQuery,
    showcaseLimit,
    showcaseQuery,
    showcase,
    relatedArticles: matched,
    invalidPage: currentPage > totalPages,
  };
}

async function loadShowcase(page: CorporatePageConfig, query: CatalogQuery | null): Promise<CatalogSnapshot | null> {
  if (!query) return null;
  if (page.showcase?.forceEmpty && !isLocalFullCatalogEnabled()) return emptySnapshot(query);
  if (query.category === "new_building") return emptySnapshot(query, "fallback");
  const engine = await getSiteEngine();
  const result = await engine.getCatalog({
    category: normalizeCategory(query.category),
    dealType: query.dealType,
    limit: query.limit,
    page: query.page,
  });
  return {
    ...emptySnapshot(query, "fallback"),
    total: result.total,
    listings: result.items as ListingCard[],
  };
}

function normalizeCategory(category: string | undefined) {
  return category === "flat" || category === "house" || category === "land" || category === "commercial" || category === "construction" || category === "garage" || category === "room" || category === "other"
    ? category
    : undefined;
}
function withLocalFullCatalogQuery(query: CatalogQuery): CatalogQuery {
  if (!isLocalFullCatalogEnabled()) return query;
  const queryWithoutCity = { ...query };
  delete queryWithoutCity.city;
  return { ...queryWithoutCity, limit: LOCAL_FULL_CATALOG_LIMIT };
}
function emptySnapshot(query: CatalogQuery, source: CatalogSnapshot["source"] = "live"): CatalogSnapshot {
  return {
    generatedAt: new Date().toISOString(), total: 0, categories: [], listings: [], source, appliedQuery: query,
    facets: { cities: [], districts: [], rooms: [], price: { min: null, max: null }, buildingTypes: [], renovations: [], landUseTypes: [], commercialTypes: [], commercialBuildingTypes: [], entranceTypes: [] },
  };
}
