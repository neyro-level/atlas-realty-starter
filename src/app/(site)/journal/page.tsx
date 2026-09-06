import type { Metadata } from "next";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { JournalHubView, type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui";
import { CatalogPropertyCard } from "@/components/catalog/CatalogPropertyCard";
import { isSalesLeaderNewBuilding } from "@/modules/new-buildings";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { siteConfig } from "@/project/site-config";
import { defaultSocialPreview, defaultSocialPreviewPath } from "@/project/social-preview";
import { getJournalHubPage } from "@/site-engine/journal-page-data";
import { breadcrumbSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";

type JournalPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: JournalPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : {};
  const hasSearch = Boolean(normalizeQuery(params.q));
  if (hasSearch) return buildSeoMetadata({ path: "/journal", title: "Журнал агентства: как выбрать и проверить недвижимость в Краснодаре", description: "Экспертные материалы агентства недвижимости о квартирах, ипотеке, земле, строительстве и новостройках в Краснодаре.", noIndex: true });
  return { title: "Журнал агентства: как выбрать и проверить недвижимость в Краснодаре", description: "Экспертные материалы агентства недвижимости о квартирах, ипотеке, земле, строительстве и новостройках в Краснодаре.", alternates: { canonical: "/journal" }, openGraph: { title: "Журнал агентства: как выбрать и проверить недвижимость в Краснодаре", description: "Экспертные материалы агентства недвижимости о квартирах, ипотеке, земле, строительстве и новостройках в Краснодаре.", url: "/journal", siteName: siteConfig.clientFullName, type: "website", images: [defaultSocialPreview] }, twitter: { card: "summary_large_image", title: "Журнал агентства: как выбрать и проверить недвижимость в Краснодаре", description: "Экспертные материалы агентства недвижимости о квартирах, ипотеке, земле, строительстве и новостройках в Краснодаре.", images: [defaultSocialPreviewPath] } };
}

function JournalLink({ href, children, ...props }: SiteLinkRendererProps) { return <Link href={href} {...props}>{children}</Link>; }
function JournalImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = await getJournalHubPage(normalizeQuery(params.q));
  return <><JsonLd data={breadcrumbSchema([{ name: "Главная", url: "/" }, { name: "Журнал агентства", url: "/journal" }])} /><JournalHubView page={page} linkRenderer={JournalLink} imageRenderer={JournalImage} renderNewBuildingCard={(index) => { const item = page.newBuildings[index]!; return <CatalogPropertyCard key={item.id} listing={item} href={`/${item.slug}`} imageBadge={isSalesLeaderNewBuilding(item.slug) ? "Лидер продаж" : undefined} />; }} /></>;
}

function normalizeQuery(value: string | string[] | undefined) { const raw = Array.isArray(value) ? value[0] : value; return raw?.replace(/\s+/g, " ").trim() ?? ""; }
