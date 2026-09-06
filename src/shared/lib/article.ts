import type { ArticleSummary } from "@/entities/article/model";

const articleDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatArticleDate(value: string | null | undefined) {
  if (!value) {
    return "Дата публикации уточняется";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Дата публикации уточняется";
  }

  return articleDateFormatter.format(parsed);
}

export function getArticleExcerpt(article: Pick<ArticleSummary, "excerpt" | "content" | "title">) {
  const excerpt = article.excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }

  const fallback = article.content
    ?.replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  return fallback || `${article.title} — материал агентства недвижимости по недвижимости в вашем городе.`;
}

export function splitArticleContent(content: string | null | undefined) {
  const normalized = content?.trim();
  if (!normalized) {
    return ["Материал готов к публикации. Контент статьи будет добавлен в редакционном контуре агентства недвижимости."];
  }

  return normalized
    .split(/\r?\n\r?\n+/)
    .map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
}
