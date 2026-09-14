import type { Metadata } from "next";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { JournalCategoryView } from "@starter/site-ui/views";
import { CatalogPropertyCard } from "@/components/catalog/CatalogPropertyCard";
import { journalCategories, journalCategoryMap, type JournalCategoryKey } from "@/entities/article/journal-config";
import { isSalesLeaderNewBuilding } from "@/modules/new-buildings";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { routes } from "@/project/routes";
import { getJournalCategoryPage } from "@/site-engine/journal-page-data";
import { breadcrumbSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";

type Props = { params: Promise<{ category: string }> };
export async function generateStaticParams() { return journalCategories.map((category) => ({ category: category.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const category = journalCategoryMap[(await params).category as JournalCategoryKey]; return category ? buildSeoMetadata({ path: routes.journalCategory(category.slug), title: category.seoTitle, description: category.seoDescription }) : { title: "Рубрика не найдена", robots: { index: false, follow: false } }; }
function JournalLink({ href, children, ...props }: SiteLinkRendererProps) { return <Link href={href} {...props}>{children}</Link>; }
function JournalImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }

export default async function JournalCategoryPage({ params }: Props) {
  const page = await getJournalCategoryPage((await params).category);
  if (!page) notFound();
  return <><JsonLd data={breadcrumbSchema([{ name: "Главная", url: routes.home() }, { name: "Журнал агентства", url: routes.journal() }, { name: page.category.title, url: page.category.href }])} /><JournalCategoryView page={page} linkRenderer={JournalLink} imageRenderer={JournalImage} renderOfferCard={(index) => { const item = page.offer!.items[index]!; const isNewBuilding = item.id.startsWith("new-building:"); return <CatalogPropertyCard key={item.id} listing={item} href={isNewBuilding ? routes.residentialComplex(item.slug) : undefined} imageBadge={isNewBuilding && isSalesLeaderNewBuilding(item.slug) ? "Лидер продаж" : undefined} />; }} /></>;
}
