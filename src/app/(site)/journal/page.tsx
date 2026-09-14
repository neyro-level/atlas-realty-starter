import type { Metadata } from "next";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { JournalHubView } from "@starter/site-ui/views";
import { routes } from "@/project/routes";
import { siteProfile } from "@/project/tenant.config";
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
  const title = `Журнал агентства: как выбрать и проверить недвижимость в ${siteProfile.city.prepositional}`;
  const description = `Экспертные материалы агентства недвижимости о квартирах, ипотеке, земле, строительстве и новостройках в ${siteProfile.city.prepositional}.`;
  if (hasSearch) return buildSeoMetadata({ path: routes.journal(), title, description, noIndex: true });
  return { title, description, alternates: { canonical: routes.journal() }, openGraph: { title, description, url: routes.journal(), siteName: siteConfig.clientFullName, type: "website", images: [defaultSocialPreview] }, twitter: { card: "summary_large_image", title, description, images: [defaultSocialPreviewPath] } };
}

function JournalLink({ href, children, ...props }: SiteLinkRendererProps) { return <Link href={href} {...props}>{children}</Link>; }
function JournalImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = await getJournalHubPage(normalizeQuery(params.q));
  return <><JsonLd data={breadcrumbSchema([{ name: "Главная", url: routes.home() }, { name: "Журнал агентства", url: routes.journal() }])} /><JournalHubView page={page} cityPrepositional={siteProfile.city.prepositional} linkRenderer={JournalLink} imageRenderer={JournalImage} renderNewBuildingCard={(index) => { const item = page.newBuildings[index]!; return <CatalogPropertyCard key={item.id} listing={item} href={routes.residentialComplex(item.slug)} imageBadge={isSalesLeaderNewBuilding(item.slug) ? "Лидер продаж" : undefined} />; }} /></>;
}

function normalizeQuery(value: string | string[] | undefined) { const raw = Array.isArray(value) ? value[0] : value; return raw?.replace(/\s+/g, " ").trim() ?? ""; }
