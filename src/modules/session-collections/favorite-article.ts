import { buyerHelpArticleCoverImage, journalArticlePlaceholderImage } from "@/entities/article/journal-fallback";
import type { SessionListingItem } from "./types";

/** Default editorial article seeded into every favorites session. */
export const DEFAULT_FAVORITE_ARTICLE_SLUG = "kak-my-pomogaem-kupit-kvartiru";
export const DEFAULT_FAVORITE_ARTICLE_ID = `article:${DEFAULT_FAVORITE_ARTICLE_SLUG}`;

const DEFAULT_COVER = buyerHelpArticleCoverImage;

export function isArticleSessionItem(item: Pick<SessionListingItem, "id" | "categoryKey" | "path">) {
  return item.categoryKey === "article" || item.id.startsWith("article:") || item.path.startsWith("/journal/");
}

export function isDefaultFavoriteArticleId(id: string) {
  return id === DEFAULT_FAVORITE_ARTICLE_ID;
}

export function createArticleSessionItem(input: {
  slug: string;
  title: string;
  image?: string | null;
  excerpt?: string | null;
}): SessionListingItem {
  const image = input.image || journalArticlePlaceholderImage;

  return {
    id: `article:${input.slug}`,
    slug: input.slug,
    path: `/journal/${input.slug}`,
    title: input.title,
    price: null,
    address: input.excerpt?.trim() || "Журнал «АТЛАС»",
    category: "Статьи",
    categoryKey: "article",
    rooms: null,
    area: null,
    areaLiving: null,
    areaKitchen: null,
    floor: null,
    floorsTotal: null,
    builtYear: null,
    buildingType: null,
    renovation: null,
    image,
    images: image ? [image] : [],
    objectCode: null,
    isExclusive: false,
  };
}

export function createDefaultFavoriteArticle(): SessionListingItem {
  return createArticleSessionItem({
    slug: DEFAULT_FAVORITE_ARTICLE_SLUG,
    title: "Как мы помогаем купить квартиру — быстро, бесплатно и без лишних рисков",
    image: DEFAULT_COVER,
    excerpt: "Как устроена работа агентства недвижимости для покупателя.",
  });
}

/** Keep the default journal article present in every favorites list. */
export function ensureDefaultFavoriteArticle(items: SessionListingItem[]): SessionListingItem[] {
  const hasPropertyItems = items.some((item) => !isArticleSessionItem(item));
  const hasDefaultArticle = items.some((item) => isDefaultFavoriteArticleId(item.id));

  if (!hasPropertyItems) {
    return hasDefaultArticle ? items.filter((item) => !isDefaultFavoriteArticleId(item.id)) : items;
  }

  if (hasDefaultArticle) {
    return items;
  }

  return [...items, createDefaultFavoriteArticle()];
}
