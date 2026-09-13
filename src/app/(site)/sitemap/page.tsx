import Link from "next/link";
import type { HtmlSitemapPageDto, SitemapColumnDto, SitemapLinkDto } from "@starter/site-contracts";
import { HtmlSitemapView, type SiteLinkRendererProps } from "@starter/site-ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { journalCategories } from "@/entities/article/journal-config";
import { catalogPresets } from "@/modules/catalog/presets";
import { getSitemapCorporatePagePaths } from "@/modules/catalog/seo";
import { publishedNewBuildings } from "@/modules/new-buildings";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { corporatePagePaths, getCorporatePage } from "@/project/corporate-pages";
import { legalDocuments } from "@/project/legal-pages";
import { routes } from "@/project/routes";
import { getSiteEngine, getSiteEngineMode } from "@/site-engine";
import { loadSitemapListingPage } from "@/site-engine/sitemap-page-data";

export const revalidate = 300;
export const metadata = buildSeoMetadata({ path: routes.htmlSitemap(), title: "Карта сайта", description: "HTML-карта публичных страниц сайта «АТЛАС»: недвижимость, новостройки, журнал, компания, правовые документы и объекты." });

const flatPages = itemsFromCatalog(["kvartiry", "odnokomnatnye-kvartiry", "dvuhkomnatnye-kvartiry", "trehkomnatnye-kvartiry", "kvartiry-studii", "vtorichnoe-zhile"]);
const countrysidePages = itemsFromCatalog(["zagorodnaya", "doma", "zemelnye-uchastki", "stroitelstvo"]);
const commercialPages = itemsFromCatalog(["kommercheskaya", "ofisy", "torgovye-pomeshcheniya", "sklady", "gotovyy-biznes", "svobodnoe-naznachenie"]);
const servicePages = itemsFromCorporate(["ipoteka", "prodazha-nedvizhimosti", "bezopasnaya-sdelka", "yurist", "rieltor-city"]);

function SitemapLink({ href, children, className, ariaCurrent }: SiteLinkRendererProps) { return <Link href={href} className={className} aria-current={ariaCurrent}>{children}</Link>; }

export default async function HtmlSitemapPage() {
  const [objects, reserve, articles, residentialComplexes] = await Promise.all([
    loadSitemapListingPage("objects", 1, 1),
    loadSitemapListingPage("reserve", 1, 1),
    (await getSiteEngine()).getArticles(),
    getSiteEngineMode() === "payload"
      ? (await import("@/site-engine/payload-new-building")).getPayloadNewBuildings()
      : publishedNewBuildings,
  ]);
  const paths = new Set(getSitemapCorporatePagePaths(corporatePagePaths));
  const main = getCorporateItem("nedvizhimost");
  const newBuildings = getCorporateItem("novostroy");
  const realEstate: SitemapColumnDto[] = [
    { title: "Квартиры", items: filterExisting(flatPages, paths) },
    { title: "Новостройки", items: [...(newBuildings && paths.has(newBuildings.href) ? [newBuildings] : []), ...residentialComplexes.map((item) => ({ href: routes.residentialComplex(item.slug), label: item.name }))] },
    { title: "Загородная", items: filterExisting(countrysidePages, paths) },
    { title: "Коммерческая", items: filterExisting(commercialPages, paths) },
    { title: "Общий раздел", items: main ? [main] : [] },
  ];
  const services: SitemapColumnDto[] = [
    { title: "Ипотека", items: filterExisting(servicePages.filter((item) => item.href.includes("ipoteka")), paths) },
    { title: "Сервисы", items: filterExisting(servicePages.filter((item) => !item.href.includes("ipoteka")), paths) },
    { title: "Компания", items: [{ href: routes.home(), label: "Главная" }, ...itemsFromCorporate(["kontakty", "o-kompanii", "rabota-rieltorom", "reviews"]), { href: routes.employees(), label: "Сотрудники" }, { href: routes.htmlSitemap(), label: "Карта сайта" }] },
    { title: "Личные подборки", items: [{ href: routes.favorites(), label: "Избранное" }, { href: routes.comparison(), label: "Сравнение" }] },
  ];
  const objectColumns: SitemapColumnDto[] = [{ title: `Актуальные объекты: ${objects.total}`, items: pageItems("objects", objects.total) }, { title: `Резерв объектов: ${reserve.total}`, items: pageItems("reserve", reserve.total) }];
  const articleColumns = chunkItems(articles.map((article) => ({ href: routes.article(article.slug), label: article.title })), 4);
  const journal: SitemapColumnDto[] = [{ title: "Рубрики", items: [{ href: routes.journal(), label: "Журнал агентства", emphasis: true }, ...journalCategories.map((category) => ({ href: routes.journalCategory(category.slug), label: category.title, emphasis: true }))] }, ...articleColumns.map((items, index) => ({ title: index === 0 ? "Статьи" : undefined, items }))];
  const legal: SitemapColumnDto[] = [{ title: "Документы", items: [{ href: routes.legal(), label: "Правовая информация" }, ...legalDocuments.map((document) => ({ href: routes.rootPage(document.slug), label: document.shortTitle }))] }];
  const all = [...realEstate, ...services, ...objectColumns, ...journal, ...legal];
  const metrics = countPublishedPages(all, objects.total + reserve.total);
  const page: HtmlSitemapPageDto = { metrics, sections: [{ title: "Недвижимость", columns: realEstate, grouped: true }, { title: "Сервисы и компания", columns: services }, { title: "Объекты недвижимости", columns: objectColumns, count: objects.total + reserve.total }, { title: "Журнал агентства", columns: journal }, { title: "Правовая информация", columns: legal }] };
  return <HtmlSitemapView page={page} breadcrumbs={<Breadcrumbs items={[{ label: "Главная", href: routes.home() }, { label: "Карта сайта" }]} className="mb-5" />} linkRenderer={SitemapLink} />;
}

function itemsFromCatalog(slugs:string[]):SitemapLinkDto[]{return slugs.flatMap((slug)=>{const item=catalogPresets.find((entry)=>entry.slug===slug);return !item||item.indexing!=="index"?[]:[{href:routes.rootPage(item.slug),label:item.navLabel}];});}
function itemsFromCorporate(slugs:string[]):SitemapLinkDto[]{return slugs.flatMap((slug)=>{const item=getCorporateItem(slug);return item?[item]:[];});}
function getCorporateItem(slug:string):SitemapLinkDto|null{const page=getCorporatePage(slug);return page?{href:routes.rootPage(page.slug),label:page.navLabel}:null;}
function filterExisting(items:SitemapLinkDto[],paths:Set<string>){return items.filter((item)=>paths.has(item.href));}
function pageItems(kind:"objects"|"reserve",total:number,pageSize=200):SitemapLinkDto[]{const pages=Math.ceil(total/pageSize);return Array.from({length:pages},(_,index)=>({href:routes.htmlSitemapListing(kind,index+1),label:`Страница ${index+1} из ${pages}`,countAsPublishedPage:false}));}
function countPublishedPages(columns:SitemapColumnDto[],objectPages:number){const paths=new Set<string>();columns.forEach((column)=>column.items.forEach((item)=>{if(item.countAsPublishedPage!==false)paths.add(item.href);}));return {staticPages:paths.size,objectPages,totalPages:paths.size+objectPages};}
function chunkItems<T>(items:T[],count:number){const columns=Array.from({length:count},()=>[] as T[]);items.forEach((item,index)=>columns[index%count]!.push(item));return columns.filter((column)=>column.length);}
