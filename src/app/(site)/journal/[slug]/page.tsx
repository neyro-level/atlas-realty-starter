import type { Metadata } from "next";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { JournalArticleView } from "@starter/site-ui/views";
import { routes } from "@/project/routes";
import { siteProfile } from "@/project/tenant.config";
import { CatalogPropertyCard } from "@/components/catalog/CatalogPropertyCard";
import { getArticleEditorialMeta } from "@/entities/article/editorial";
import { isSalesLeaderNewBuilding } from "@/modules/new-buildings";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getSiteEngine } from "@/site-engine";
import { getJournalArticlePage } from "@/site-engine/journal-article-data";
import { getArticleExcerpt } from "@/shared/lib/article";
import { articleSchema, breadcrumbSchema, faqPageSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { ArticleActions } from "./ArticleActions";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const slug = (await params).slug; const article = await (await getSiteEngine()).getArticle(slug); if (!article) return { title: "Материал не найден", robots: { index: false, follow: false } }; return buildSeoMetadata({ path: routes.article(slug), title: (article.seoTitle ?? article.title).replace(/\s*\|\s*«АТЛАС»\s*$/u, "").trim(), description: article.seoDescription ?? getArticleExcerpt(article), image: article.coverImage }); }
function JournalLink({ href, children, ...props }: SiteLinkRendererProps) { return <Link href={href} {...props}>{children}</Link>; }
function JournalImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }

export default async function JournalArticlePage({ params }: Props) {
  const page = await getJournalArticlePage((await params).slug);
  if (!page) notFound();
  const meta = getArticleEditorialMeta(page.article.slug);
  const actions = (variant: "desktop" | "mobile") => <ArticleActions title={page.article.title} slug={page.article.slug} coverImage={page.article.coverImage} excerpt={page.article.excerpt ?? page.article.seoDescription} variant={variant} className={variant === "desktop" ? "hidden sm:flex" : "mt-4 sm:hidden"} />;
  const renderCard = (items: typeof page.relatedNewBuildings, index: number) => { const item = items[index]!; const isNewBuilding = item.id.startsWith("new-building:"); return <CatalogPropertyCard key={item.id} listing={item} href={isNewBuilding ? routes.residentialComplex(item.slug) : undefined} imageBadge={isNewBuilding && isSalesLeaderNewBuilding(item.slug) ? "Лидер продаж" : undefined} />; };
  return <><JsonLd data={breadcrumbSchema([{ name: "Главная", url: routes.home() }, { name: "Журнал агентства", url: routes.journal() }, { name: page.article.title, url: routes.article(page.article.slug) }])} /><JsonLd data={articleSchema(page.article, meta)} />{page.faq.length ? <JsonLd data={faqPageSchema(page.faq)} /> : null}<JournalArticleView page={page} cityGenitive={siteProfile.city.genitive} linkRenderer={JournalLink} imageRenderer={JournalImage} renderActions={actions} renderShowcaseCard={(index) => renderCard(page.showcase?.items ?? [], index)} renderBottomNewBuildingCard={(index) => renderCard(page.relatedNewBuildings, index)} /></>;
}
