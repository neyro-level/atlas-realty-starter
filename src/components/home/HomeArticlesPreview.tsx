import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { HomeArticlesPreviewView, type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui";
import { HomeCarouselScrollHint } from "@/components/home/HomeCarouselScrollHint";
import { journalCategories } from "@/entities/article/journal-config";
import type { ArticleSummary } from "@/entities/article/model";
import { toArticleCard } from "@/site-engine/journal-page-data";

function HomeArticleLink({ href, children, ...props }: SiteLinkRendererProps) { return <Link href={href} {...props}>{children}</Link>; }
function HomeArticleImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }

export function HomeArticlesPreview({ articles }: { articles: ArticleSummary[] }) {
  const cards = articles.filter((article) => article.coverImage).slice(0, 4).map(toArticleCard);
  const categories = journalCategories.map((category) => ({ slug: category.slug, title: category.title, href: `/journal/category/${category.slug}` }));
  return <HomeArticlesPreviewView articles={cards} categories={categories} linkRenderer={HomeArticleLink} imageRenderer={HomeArticleImage} scrollHint={<HomeCarouselScrollHint trackId="home-articles-track" />} />;
}
