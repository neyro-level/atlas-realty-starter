import "server-only";
import type { PropertyCardDto } from "@starter/site-contracts";
import { getSiteEngine } from "./index";

export type SitemapListingKind = "objects" | "reserve";
export type SitemapListingPageData = {
  items: Array<Pick<PropertyCardDto, "id" | "slug" | "title">>;
  total: number;
  page: number;
  pageSize: number;
};
export async function loadSitemapListingPage(kind: SitemapListingKind, page: number, pageSize = 200): Promise<SitemapListingPageData> {
  if (kind === "reserve") return { items: [], total: 0, page, pageSize };
  const result = await (await getSiteEngine()).getCatalog({ page, limit: pageSize });
  return { items: result.items.map(({ id, slug, title }) => ({ id, slug, title })), total: result.total, page, pageSize };
}
