import "server-only";
import type { ArticleDto, JournalArticleMediaDto, JournalArticlePageDto } from "@starter/site-contracts";
import { getArticleEditorialMeta, getRelatedArticles, type ArticleTopicKey } from "@/entities/article/editorial";
import { journalArticlePlaceholderImage } from "@/entities/article/journal-fallback";
import { formatArticleDate, splitArticleContent } from "@/shared/lib/article";
import { getSiteEngine } from "./index";
import { toArticleCard } from "./journal-page-data";

type FallbackSection = { title: string; start: number };
const fallbackSections: Partial<Record<string, FallbackSection[]>> = {
  "kak-proverit-dom-pered-pokupkoy": [{ title: "С чего начать проверку дома", start: 0 }, { title: "Документы на дом", start: 3 }, { title: "Земельный участок", start: 4 }, { title: "Документы продавца", start: 7 }, { title: "Технический осмотр дома", start: 9 }, { title: "Что проверить до аванса", start: 13 }, { title: "Когда нужен специалист", start: 15 }],
  "dokumenty-pri-pokupke-doma": [{ title: "Два пакета документов: дом и земля", start: 0 }, { title: "Документы на дом", start: 2 }, { title: "Документы на земельный участок", start: 5 }, { title: "Документы продавца", start: 8 }, { title: "Типичные проблемы в документах", start: 11 }, { title: "Документы для сделки", start: 12 }, { title: "Когда стоит подключить специалиста", start: 15 }],
  "kak-prodat-kvartiru-v-gorode": [{ title: "Почему продажа затягивается", start: 0 }, { title: "Шаг 1. Определить рыночную цену", start: 1 }, { title: "Шаг 2. Подготовить документы", start: 3 }, { title: "Шаг 3. Подготовить квартиру к показу", start: 5 }, { title: "Шаг 4. Сделать объявление", start: 7 }, { title: "Шаг 5. Провести показы и переговоры", start: 9 }, { title: "Шаг 6. Зафиксировать аванс", start: 11 }, { title: "Шаг 7. Провести сделку и расчёт", start: 12 }, { title: "Когда лучше обратиться к специалисту", start: 13 }],
  "ipoteka-2-protsenta-city": [{ title: "Как устроены льготные ипотечные программы", start: 0 }, { title: "Кому доступна программа", start: 1 }, { title: "Какие объекты подходят", start: 2 }, { title: "Первый взнос, срок и платёж", start: 3 }, { title: "Аккредитованные ЖК", start: 5 }, { title: "Как подать заявку", start: 7 }, { title: "Частые вопросы и подводные камни", start: 8 }, { title: "Как использовать программу спокойно", start: 11 }],
  "kak-my-pomogaem-kupit-kvartiru": [{ title: "Проверенная база — вы не тратите время на «пустые» объекты", start: 0 }, { title: "Услуги для покупателя — бесплатные", start: 2 }, { title: "Ипотека — с экспертом одобрение выше на 20%", start: 8 }, { title: "Юридический отдел — не только для сделки", start: 9 }, { title: "Слово директора", start: 11 }, { title: "Доверьте сделку «агентству недвижимости» — и спите спокойно", start: 13 }],
};

const sectionMedia: Partial<Record<string, Partial<Record<string, JournalArticleMediaDto>>>> = {
  "kak-proverit-kvartiru-pered-pokupkoy": { "Шаг 4. Осмотр квартиры: что смотреть физически": { src: "/images/journal/kak-proverit-kvartiru-pered-pokupkoy-inspection.webp", alt: "Осмотр квартиры перед покупкой: проверка состояния стен, окон и возможных дефектов" } },
  "dokumenty-pri-pokupke-kvartiry": { "Документы продавца: кто на самом деле продаёт": { src: "/images/journal/dokumenty-pri-pokupke-kvartiry-seller-check.webp", alt: "Проверка документов продавца квартиры: паспорт, доверенность и согласие супруга" } },
  "etapy-stroitelstva-doma": { "Этап 5. Строительство: что контролировать по ходу": { src: "/images/journal/etapy-stroitelstva-doma-construction-control.webp", alt: "Контроль этапов строительства дома: проверка фундамента, стен и качества работ на площадке" } },
  "smeta-na-stroitelstvo-doma": { "Что обычно не входит в смету — и должно быть добавлено": { src: "/images/journal/smeta-na-stroitelstvo-doma-missing-costs.webp", alt: "Проверка сметы на строительство дома: скрытые расходы, пропущенные позиции и дополнительные работы" } },
  "kak-vybrat-ipoteku": { "Шаг 5. На что смотреть в условиях программы": { src: "/images/journal/kak-vybrat-ipoteku-program-terms.webp", alt: "Сравнение условий ипотечной программы: ставка, страховка, комиссии, срок и досрочное погашение" } },
  "kak-vybrat-kvartiru-v-ipoteku": { "Критерий 3. Документы объекта: что проверит банк": { src: "/images/journal/kak-vybrat-kvartiru-v-ipoteku-documents-check.webp", alt: "Проверка документов квартиры для ипотечной сделки: выписка, правоустанавливающие документы, техпаспорт и планировка" } },
  "kak-my-pomogaem-kupit-kvartiru": { "Слово директора": { src: "/images/expert-portrait.svg", alt: "Чирков Андрей Александрович, эксперт агентства недвижимости", frameClassName: "aspect-[4/5] sm:aspect-[5/4] md:aspect-[16/11]", objectClassName: "object-cover object-[center_22%]" } },
};

const galleries: Partial<Record<string, JournalArticleMediaDto[]>> = { "kak-my-pomogaem-kupit-kvartiru": [
  { src: "/images/journal/kak-my-pomogaem-kupit-kvartiru/01-office-director.png", alt: "Директор агентства «АТЛАС» за рабочим столом в офисе" }, { src: "/images/journal/kak-my-pomogaem-kupit-kvartiru/02-office-team-desk.png", alt: "Команда агентства недвижимости за разбором документов в офисе" }, { src: "/images/journal/kak-my-pomogaem-kupit-kvartiru/03-office-open-space.png", alt: "Офис агентства недвижимости: специалисты и клиенты за рабочими столами" }, { src: "/images/journal/kak-my-pomogaem-kupit-kvartiru/04-office-workspace.png", alt: "Рабочее пространство офиса агентства недвижимости" },
] };

export async function getJournalArticlePage(slug: string): Promise<JournalArticlePageDto | null> {
  const engine = await getSiteEngine();
  const article = await engine.getArticle(slug);
  if (!article) return null;
  const meta = getArticleEditorialMeta(slug);
  const [allArticles, newBuildings] = await Promise.all([engine.getArticles(), engine.getNewBuildingCards()]);
  const showcaseConfig = getShowcaseConfig(meta?.topic);
  const showcaseItems = showcaseConfig.kind === "newBuildings" ? newBuildings.slice(0, 3) : (await engine.getCatalog({ category: showcaseConfig.category, dealType: "sale", limit: 3, sort: "newest" })).items.slice(0, 3);
  const sections = normalizeSections(article);
  const cta = article.document?.cta ?? meta?.cta ?? null;
  return {
    article,
    topicLabel: meta?.topicLabel ?? "Материал",
    dateLabel: formatArticleDate(article.publishedAt),
    readingTimeLabel: `${getReadingTime(article)} мин`,
    author: { name: "Анна Сергеевна", role: "Автор", image: "/images/authors/anna-sergeevna.webp" },
    cover: { src: article.coverImage || journalArticlePlaceholderImage, alt: article.coverImage ? article.title : "" },
    lead: article.document?.lead ?? "",
    contents: sections.filter((item) => item.title).map((item) => ({ id: item.id, title: item.title })),
    sections,
    gallery: galleries[slug] ?? [],
    galleryBeforeBody: !Object.prototype.hasOwnProperty.call({ "kak-my-pomogaem-kupit-kvartiru": 2 }, slug),
    galleryAfterSectionIndex: slug === "kak-my-pomogaem-kupit-kvartiru" ? 2 : null,
    faq: article.document?.faq ?? [],
    cta,
    ctaImage: slug === "kak-my-pomogaem-kupit-kvartiru" ? null : getCtaImage(meta?.topic, article.coverImage),
    editorialLinks: meta?.inlineLinks.map((item) => ({ label: item.label, href: item.href, description: item.description })) ?? [],
    footerLinks: meta?.footerLinks.map((item) => ({ label: item.label, href: item.href, description: item.description })) ?? [],
    showcase: article.document && showcaseItems.length ? { action: { href: showcaseConfig.href, label: showcaseConfig.label }, items: showcaseItems, afterSectionIndex: Math.min(2, Math.max(0, sections.length - 1)), insideSection: false } : null,
    relatedArticles: getRelatedArticles(article, allArticles, 8).map(toArticleCard),
    relatedProperties: [],
    relatedNewBuildings: newBuildings,
  };
}

function normalizeSections(article: ArticleDto): JournalArticlePageDto["sections"] {
  if (article.document?.sections.length) return article.document.sections.map((section, index) => ({ id: sectionId(section.title, index), title: section.title, blocks: section.blocks, media: sectionMedia[article.slug]?.[section.title] ?? null }));
  const paragraphs = splitArticleContent(article.content);
  const config = fallbackSections[article.slug] ?? [];
  if (!config.length) return [{ id: "article-content", title: "", blocks: paragraphs.map((text) => ({ type: "paragraph" as const, text })) }];
  return config.map((section, index) => ({ id: sectionId(section.title, index), title: section.title, blocks: paragraphs.slice(section.start, config[index + 1]?.start ?? paragraphs.length).map((text) => ({ type: "paragraph" as const, text })), media: sectionMedia[article.slug]?.[section.title] ?? null })).filter((section) => section.blocks.length);
}

function getReadingTime(article: ArticleDto) { const text = article.document ? [article.document.lead, ...article.document.sections.flatMap((section) => [section.title, ...section.blocks.flatMap((block) => block.type === "paragraph" ? [block.text] : block.type === "list" ? block.items : [block.title, ...block.body])]), ...article.document.faq.flatMap((item) => [item.question, item.answer])].filter(Boolean).join(" ") : article.content ?? article.excerpt ?? article.title; return Math.max(3, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 180)); }
function sectionId(title: string, index: number) { const value = title.toLowerCase().replace(/ё/gu, "е").replace(/[^a-zа-я0-9]+/giu, "-").replace(/^-|-$/g, ""); return `section-${index + 1}-${value || "material"}`; }
function getShowcaseConfig(topic: ArticleTopicKey | undefined) { switch (topic) { case "stroitelstvo": return { kind: "listings" as const, category: "construction" as const, href: "/stroitelstvo", label: "Открыть строительство" }; case "uchastki": return { kind: "listings" as const, category: "land" as const, href: "/zemelnye-uchastki", label: "Открыть участки" }; case "doma": return { kind: "listings" as const, category: "house" as const, href: "/doma", label: "Открыть дома" }; case "ipoteka": case "novostroyki": return { kind: "newBuildings" as const, category: undefined, href: "/novostroyki", label: "Открыть новостройки" }; default: return { kind: "listings" as const, category: "flat" as const, href: "/kvartiry", label: "Открыть квартиры" }; } }
function getCtaImage(topic: ArticleTopicKey | undefined, cover: string | null) { if (topic === "stroitelstvo" || topic === "doma") return "/images/agency-home-houses.jpg"; return cover || "/images/agency-home-secondary-hero.webp"; }
