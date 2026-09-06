import "server-only";
import type {
  ArticleDto,
  JournalArticleCardDto,
  JournalCategoryPageDto,
  JournalHubPageDto,
} from "@starter/site-contracts";
import { journalArticlePlaceholderImage } from "@/entities/article/journal-fallback";
import { getArticleEditorialMeta, type ArticleTopicKey } from "@/entities/article/editorial";
import { journalCategories, journalCategoryMap, type JournalCategoryKey } from "@/entities/article/journal-config";
import { formatArticleDate, getArticleExcerpt } from "@/shared/lib/article";
import { getSiteEngine } from "./index";

type RubricPageConfig = {
  h1: string;
  lead: string;
  topics: ArticleTopicKey[];
  offerTitle: string;
  offerHref: string;
  offerLabel: string;
  catalogKind: "listings" | "newBuildings";
  listingCategory?: "flat" | "land" | "construction";
};

const rubricPages: Record<JournalCategoryKey, RubricPageConfig> = {
  kvartiry: { h1: "Статьи о недвижимости", lead: "Разбираем покупку, продажу, проверку документов и выбор квартиры в Краснодаре спокойным практическим языком.", topics: ["buying", "selling", "doma"], offerTitle: "Квартиры, которые можно разобрать со специалистом", offerHref: "/kvartiry", offerLabel: "Открыть квартиры", catalogKind: "listings", listingCategory: "flat" },
  ipoteka: { h1: "Статьи об ипотеке", lead: "Показываем, как сравнивать программы, считать платёж и выбирать объект, который банк действительно одобрит.", topics: ["ipoteka"], offerTitle: "Объекты для ипотечного сценария", offerHref: "/ipoteka", offerLabel: "Открыть ипотеку", catalogKind: "listings", listingCategory: "flat" },
  stroitelstvo: { h1: "Статьи о строительстве", lead: "Участок, смета, этапы работ и контроль подрядчика до договора и во время строительства дома.", topics: ["stroitelstvo"], offerTitle: "Проекты и сценарии строительства", offerHref: "/stroitelstvo", offerLabel: "Открыть строительство", catalogKind: "listings", listingCategory: "construction" },
  uchastki: { h1: "Статьи о земельных участках", lead: "Как выбирать землю, проверять границы, назначение, ограничения и документы до аванса.", topics: ["uchastki"], offerTitle: "Участки, которые стоит проверить до покупки", offerHref: "/zemelnye-uchastki", offerLabel: "Открыть участки", catalogKind: "listings", listingCategory: "land" },
  novostroyki: { h1: "Статьи о новостройках", lead: "Сравниваем ЖК, застройщиков, сроки сдачи, планировки и ипотечные условия без рекламного шума.", topics: ["novostroyki"], offerTitle: "Новостройки для сравнения", offerHref: "/novostroyki", offerLabel: "Открыть новостройки", catalogKind: "newBuildings" },
};

export async function getJournalHubPage(query = ""): Promise<JournalHubPageDto> {
  const engine = await getSiteEngine();
  const [articles, newBuildings] = await Promise.all([engine.getArticles(), engine.getNewBuildingCards()]);
  const filtered = query ? filterArticles(articles, query) : articles;
  const sections = query ? [{ id: "journal-search", title: `Поиск: ${query}`, action: { href: "/journal", label: "Сбросить" }, articles: filtered.map(toArticleCard), emptyText: "По этому запросу материалы не найдены. Попробуйте другой запрос или откройте рубрики журнала." }] : [
    { id: "journal-section-real-estate", title: "Статьи о недвижимости", action: { href: "/journal/category/kvartiry", label: "Посмотреть все" }, articles: pickByTopics(articles, ["buying", "selling", "doma"]).slice(0, 3).map(toArticleCard) },
    { id: "journal-section-mortgage", title: "Ипотека и новостройки", action: { href: "/journal/category/ipoteka", label: "Посмотреть все" }, articles: pickByTopics(articles, ["ipoteka", "novostroyki"]).slice(0, 3).map(toArticleCard) },
    { id: "journal-section-guides", title: "Инструкции и проверки", action: { href: "/journal/category/stroitelstvo", label: "Посмотреть все" }, articles: pickByTopics(articles, ["stroitelstvo", "uchastki"]).slice(0, 3).map(toArticleCard) },
  ];
  return {
    query,
    categories: journalCategories.map((item) => ({ slug: item.slug, title: item.title, href: `/journal/category/${item.slug}` })),
    popular: articles.slice(0, 5).map(toArticleCard),
    sections,
    newBuildings: newBuildings.slice(0, 3),
    interests: [
      { label: "Квартиры с проверкой", href: "/kvartiry" }, { label: "Новостройки с ипотекой", href: "/novostroyki" },
      { label: "Дома и участки", href: "/doma" }, { label: "Ипотека", href: "/ipoteka" }, { label: "Безопасная сделка", href: "/bezopasnaya-sdelka" },
    ],
  };
}

export async function getJournalCategoryPage(categorySlug: string): Promise<JournalCategoryPageDto | null> {
  const category = journalCategoryMap[categorySlug as JournalCategoryKey];
  if (!category) return null;
  const config = rubricPages[category.slug];
  const engine = await getSiteEngine();
  const [articles, offers] = await Promise.all([
    engine.getArticles(),
    config.catalogKind === "newBuildings" ? engine.getNewBuildingCards() : engine.getCatalog({ category: config.listingCategory, dealType: "sale", limit: 4, sort: "newest" }).then((result) => result.items),
  ]);
  const categoryArticles = pickRubricArticles(articles, category.slug, config);
  const leadArticles = fillArticles(categoryArticles, articles, 3);
  const leadSlugs = new Set(leadArticles.map((article) => article.slug));
  const featureArticle = articles.find((article) => !leadSlugs.has(article.slug)) ?? leadArticles[0] ?? null;
  const usedSlugs = new Set([...leadSlugs, featureArticle?.slug].filter(Boolean) as string[]);
  return {
    category: { slug: category.slug, title: category.title, href: `/journal/category/${category.slug}`, active: true },
    categories: journalCategories.map((item) => ({ slug: item.slug, title: item.title, href: `/journal/category/${item.slug}`, active: item.slug === category.slug })),
    h1: config.h1,
    lead: config.lead,
    primaryArticles: leadArticles.map(toArticleCard),
    featuredArticle: featureArticle ? toArticleCard(featureArticle) : null,
    moreArticles: articles.filter((article) => !usedSlugs.has(article.slug)).slice(0, 12).map(toArticleCard),
    offer: offers.length ? { title: config.offerTitle, action: { href: config.offerHref, label: config.offerLabel }, items: offers.slice(0, 4) } : null,
    consultation: {
      title: "Поможем применить это к вашей ситуации",
      text: `Подскажем, какие материалы из рубрики «${category.title}» важны именно для вашего объекта, бюджета и сценария сделки.`,
      buttonLabel: "Получить консультацию",
      modalTitle: "Получить консультацию по материалам журнала",
      modalSubtitle: `Расскажите, какой вопрос из рубрики «${category.title}» хотите разобрать. Специалист агентства недвижимости подскажет следующий шаг.`,
      source: "journal:category:consult",
    },
  };
}

export function toArticleCard(article: ArticleDto): JournalArticleCardDto {
  const meta = getArticleEditorialMeta(article.slug);
  return { id: article.id, slug: article.slug, href: `/journal/${article.slug}`, title: article.title, excerpt: getArticleExcerpt(article), image: article.coverImage || journalArticlePlaceholderImage, dateLabel: formatArticleDate(article.publishedAt), topicLabel: meta?.topicLabel ?? "Материал" };
}

function pickByTopics(articles: ArticleDto[], topics: ArticleTopicKey[]) { return articles.filter((article) => { const topic = getArticleEditorialMeta(article.slug)?.topic; return topic ? topics.includes(topic) : false; }); }
function filterArticles(articles: ArticleDto[], query: string) { const needle = query.toLowerCase(); return articles.filter((article) => [article.title, article.excerpt, article.content, getArticleEditorialMeta(article.slug)?.topicLabel, getArticleEditorialMeta(article.slug)?.keywords.join(" ")].filter(Boolean).join(" ").toLowerCase().includes(needle)); }
function pickRubricArticles(articles: ArticleDto[], slug: JournalCategoryKey, config: RubricPageConfig) { const category = journalCategoryMap[slug]; return articles.filter((article) => category.articleSlugs.includes(article.slug) || Boolean(getArticleEditorialMeta(article.slug)?.topic && config.topics.includes(getArticleEditorialMeta(article.slug)!.topic))); }
function fillArticles(primary: ArticleDto[], fallback: ArticleDto[], count: number) { const selected = [...primary]; const slugs = new Set(selected.map((item) => item.slug)); for (const item of fallback) { if (selected.length >= count) break; if (!slugs.has(item.slug)) { selected.push(item); slugs.add(item.slug); } } return selected.slice(0, count); }
