import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HtmlSitemapListingPage } from "@/components/marketing/HtmlSitemapListingPage";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { loadSitemapListingPage } from "@/site-engine/sitemap-page-data";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const page = Number((await params).page);
  const pageSuffix = page > 1 ? `, страница ${page}` : "";

  return buildSeoMetadata({
    path: `/sitemap/objects/${page}`,
    title: `Актуальные объекты — карта сайта${pageSuffix}`,
    description: `Список актуальных объектов недвижимости агентства недвижимости${pageSuffix}.`,
  });
}

export default async function SitemapObjectsPage({ params }: { params: Promise<{ page: string }> }) {
  const page = Number((await params).page);
  if (!Number.isInteger(page) || page < 1) notFound();
  const result = await loadSitemapListingPage("objects", page);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  if (page > totalPages) notFound();
  return <HtmlSitemapListingPage kind="objects" result={result} />;
}
