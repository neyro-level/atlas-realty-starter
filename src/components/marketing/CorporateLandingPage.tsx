import Link from "next/link";
import Image, { type ImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import type { CorporateLandingPageDto } from "@starter/site-contracts";
import { CareersComparisonView, CareersFinalCtaView, CareersTrainingView, CareersWorkSystemView, MortgageBrokerSupportView, MortgageCalculatorView, MortgageProgramsView, RequestModalButton, SaleFinalCtaView, SalePricingPrinciplesView, SalePromotionView, SaleReportingView, type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui";
import { CorporateLandingView } from "./CorporateLandingView";
import { AboutCompanyDirectorSection } from "@/components/marketing/AboutCompanyDirectorSection";
import { AboutCompanyFinalCtaSection } from "@/components/marketing/AboutCompanyFinalCtaSection";
import { AboutCompanyTeamSection } from "@/components/marketing/AboutCompanyTeamSection";
import { CatalogBuyerServicesSection } from "@/components/marketing/CatalogBuyerServicesSection";
import { CatalogHeroBlock } from "@/components/marketing/CatalogHeroBlock";
import { NewBuildingCatalogConversion } from "@/components/marketing/NewBuildingCatalogConversion";
import { NewBuildingCatalogLeadSection } from "@/components/marketing/NewBuildingCatalogLeadSection";
import { NewBuildingMobileConversionBar } from "@/components/marketing/NewBuildingMobileConversionBar";
import { CareersQuizButton, CareersQuizModal } from "@/components/marketing/CareersQuiz";
import { MortgageConsultationSection } from "@/components/marketing/MortgageConsultationSection";
import { LawyerPageSections } from "@/components/marketing/LawyerPageSections";
import { siteProfile } from "@/project/tenant.config";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { CatalogSharpShowcase } from "@/components/catalog/CatalogSharpShowcase";
import { RealEstateFaqSection } from "@/components/marketing/RealEstateFaqSection";
import { PopularSearchesSection } from "@/components/marketing/PopularSearchesSection";
import { PropertyPurchaseFlowBlocks } from "@/components/marketing/PropertyPurchaseFlowBlocks";
import { SalePreparationSection } from "@/components/marketing/SalePreparationSection";
import { SaleNegotiationSection } from "@/components/marketing/SaleNegotiationSection";
import { SaleFaqSection } from "@/components/marketing/SaleFaqSection";
import { faqItemsToSchema } from "@/components/marketing/agency-faq-content";
import { getCatalogFaqItems } from "@/components/marketing/catalog-faq-registry";
import type { CatalogQuery, CatalogSnapshot } from "@/lib/catalog";
import type { ArticleSummary } from "@/entities/article/model";
import type { CorporatePageConfig } from "@/project/corporate-pages";
import { breadcrumbSchema, catalogItemListSchema, faqPageSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { careersComparison, careersFinalCta, careersTraining, careersWorkSystem } from "@/project/careers-page";
import { filterNewBuildings, type NewBuilding } from "@/modules/new-buildings";
import { getPropertyPath } from "@/project/site-config";

type CorporateLandingPageProps = {
  page: CorporatePageConfig;
  visitorQuery: CatalogQuery;
  showcaseLimit: number;
  showcaseQuery: CatalogQuery | null;
  showcase: CatalogSnapshot | null;
  complexes: NewBuilding[];
  relatedArticles: ArticleSummary[];
};

export function CorporateLandingPage({ page, visitorQuery, showcaseLimit, showcaseQuery, showcase, complexes, relatedArticles }: CorporateLandingPageProps) {
  const hasCatalogHero = CATALOG_HERO_SLUGS.has(page.slug);
  const isMainCatalogIndex = page.slug === "nedvizhimost";
  const hasNewBuildingConversionFlow = page.slug === "novostroyki";
  const hasBuyerServices = Boolean(page.showcase && showcase && !isMainCatalogIndex && !hasNewBuildingConversionFlow);
  const catalogFaqItems = getCatalogFaqItems(page.slug);
  const hasSecondaryCatalogIntro = SECONDARY_CATALOG_SLUGS.has(page.slug);
  const hasMortgagePage = page.slug === "ipoteka";
  const hasServiceHeroOnly = HERO_ONLY_SLUGS.has(page.slug);
  const usesCatalogHero = hasCatalogHero || hasMortgagePage || hasServiceHeroOnly;
  const usesPageHeroDescription = hasMortgagePage || hasServiceHeroOnly;
  const showsHeroContentOnMobile =
    page.slug === "yurist" ||
    page.slug === "rabota-rieltorom" ||
    page.slug === "o-kompanii";
  const pageDto: CorporateLandingPageDto = {
    slug: page.slug,
    eyebrow: page.eyebrow,
    heroTitle: page.heroTitle,
    heroDescription: page.heroDescription,
    microtext: page.microtext,
    heroCards: page.heroCards,
    relatedServices: [...(page.relatedServiceLinks ?? [])],
    relatedArticles: relatedArticles.map(({ slug, title, excerpt }) => ({ slug, title, excerpt: excerpt ?? "" })),
    genericHeroImage: "/images/agency-home-secondary-hero.webp",
    hasSecondaryCatalogIntro,
    usesCatalogHero,
  };
  const structuredCatalogItems = hasNewBuildingConversionFlow
    ? filterNewBuildings(complexes, showcaseQuery ?? {}).map((item) => ({
        name: item.name,
        path: `/${item.slug}`,
        image: item.media.hero?.src,
      }))
    : (showcase?.listings ?? []).map((item) => ({
        name: item.title,
        path: getPropertyPath(item.slug),
        image: item.image,
      }));
  const catalogPath = visitorQuery.page && visitorQuery.page > 1
    ? `/${page.slug}?page=${visitorQuery.page}`
    : `/${page.slug}`;
  const showCatalogStructuredData = Boolean(
    page.showcase &&
    structuredCatalogItems.length &&
    !hasNonPaginationCatalogQuery(visitorQuery),
  );

  return (
    <>
      {showCatalogStructuredData ? <>
        <JsonLd data={breadcrumbSchema([{ name: "Главная", url: "/" }, { name: page.heroTitle, url: catalogPath }])} />
        <JsonLd data={catalogItemListSchema({
          name: page.heroTitle,
          path: catalogPath,
          items: structuredCatalogItems,
          startPosition: ((visitorQuery.page ?? 1) - 1) * showcaseLimit + 1,
        })} />
      </> : null}
      <CorporateLandingView
      page={pageDto}
      breadcrumbs={<Breadcrumbs items={buildCorporateBreadcrumbs(page)} />}
      catalogHero={<CatalogHeroBlock title={page.heroTitle} variant={hasNewBuildingConversionFlow ? "new-building" : "default"} titleLines={page.heroTitleLines} titleSize={page.heroTitleSize} description={hasNewBuildingConversionFlow || usesPageHeroDescription ? page.heroDescription : undefined} descriptionVisibility={showsHeroContentOnMobile || hasNewBuildingConversionFlow ? "always" : undefined} imageSrc={page.heroImage?.src} imagePosition={page.heroImage?.position} expandedDesktop={page.heroExpandedDesktop} focusImageBottomDesktop={page.heroFocusImageBottomDesktop} actionVisibility={showsHeroContentOnMobile ? "always" : "lg+"} action={<CorporatePrimaryCta page={page} className="inline-flex min-h-12 w-full max-w-full shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[var(--accent-hover)] sm:w-auto sm:min-w-63 sm:px-6" showIcon={false} />} />}
      primaryAction={<CorporatePrimaryCta page={page} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] sm:w-fit" />}
      bodyBeforeRelated={<>
        {page.slug === "o-kompanii" ? <><AboutCompanyDirectorSection /><AboutCompanyTeamSection /><AboutCompanyFinalCtaSection /></> : null}
        {page.slug === "prodazha-nedvizhimosti" ? <><SalePricingPrinciplesView /><SalePreparationSection /><SalePromotionView cityGenitive={siteProfile.city.genitive} cityPrepositional={siteProfile.city.prepositional} /><SaleNegotiationSection /><SaleReportingView /><SaleFinalCtaView microtext="Это бесплатно и ни к чему вас не обязывает." /><SaleFaqSection /></> : null}
        {page.slug === "yurist" ? <LawyerPageSections /> : null}
        {page.slug === "rabota-rieltorom" ? <><CareersWorkSystemView content={careersWorkSystem} /><CareersComparisonView content={careersComparison} /><CareersTrainingView content={careersTraining} imageRenderer={CorporateImage} /><CareersFinalCtaView content={careersFinalCta} quizButton={<CareersQuizButton source="corporate:rabota-rieltorom:final" className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:w-auto sm:min-w-65" />} /><CareersQuizModal /></> : null}
      </>}
      secondaryBreadcrumbs={<Breadcrumbs items={buildCorporateBreadcrumbs(page)} />}
      bodyAfterRelated={hasMortgagePage ? <><MortgageProgramsView cityPrepositional={siteProfile.city.prepositional} /><MortgageCalculatorView /><MortgageBrokerSupportView imageRenderer={CorporateImage} imageSrc="/images/mortgage-broker-support.webp" /><MortgageConsultationSection /></> : null}
      showcase={page.showcase && showcase ? <><CatalogSharpShowcase catalog={showcase} complexes={complexes} query={showcaseQuery ?? { limit: showcaseLimit }} paginationQuery={visitorQuery} initialFilter={page.showcase.initialFilter} sectionId="page-showcase" basePath={`/${page.slug}`} headline={hasSecondaryCatalogIntro ? page.heroTitle : undefined} heading={page.showcase.heading} description={page.showcase.description} emptyMessage={page.showcase.emptyMessage} servicePromo={isMainCatalogIndex ? "legal" : "mortgage"} mode={hasNewBuildingConversionFlow ? "new-buildings" : "default"} defaultView={hasNewBuildingConversionFlow ? "list" : "grid"} />{hasNewBuildingConversionFlow ? <NewBuildingCatalogConversion /> : null}{hasBuyerServices ? <CatalogBuyerServicesSection sourcePage={`/${page.slug}`} /> : null}</> : null}
      afterShowcase={isMainCatalogIndex ? <PropertyPurchaseFlowBlocks sourcePage={`/${page.slug}`} leadTitle={getCatalogLeadTitle(page.slug)} /> : hasNewBuildingConversionFlow ? <><NewBuildingCatalogLeadSection /><NewBuildingMobileConversionBar /></> : null}
      footerContent={catalogFaqItems ? <><JsonLd data={faqPageSchema(faqItemsToSchema(catalogFaqItems))} /><RealEstateFaqSection items={catalogFaqItems} />{isMainCatalogIndex ? <PopularSearchesSection /> : null}</> : null}
      linkRenderer={CorporateLink}
      imageRenderer={CorporateImage}
      />
    </>
  );
}

function CorporateLink({ href, children, ariaCurrent, ariaLabel, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-current={ariaCurrent} aria-label={ariaLabel} {...props}>{children}</Link>;
}

function CorporateImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />;
}

const CATALOG_HERO_SLUGS = new Set([
  "nedvizhimost",
  "novostroyki",
  "kvartiry",
  "zagorodnaya",
  "doma",
  "zemelnye-uchastki",
  "stroitelstvo",
  "kommercheskaya-nedvizhimost",
]);

const HERO_ONLY_SLUGS = new Set([
  "prodazha-nedvizhimosti",
  "bezopasnaya-sdelka",
  "yurist",
  "o-kompanii",
  "rabota-rieltorom",
]);

const SECONDARY_CATALOG_SLUGS = new Set([
  "odnokomnatnye-kvartiry",
  "dvuhkomnatnye-kvartiry",
  "trehkomnatnye-kvartiry",
  "kvartiry-studii",
  "vtorichnoe-zhile",
  "kottedzhnye-poselki",
  "ofisy",
  "torgovye-pomeshcheniya",
  "sklady",
  "gotovyy-biznes",
  "svobodnoe-naznachenie",
]);

const CATALOG_LEAD_TITLES: Record<string, string> = {
  "nedvizhimost": "Нужна помощь с выбором недвижимости?",
  novostroyki: "Нужна помощь с выбором новостройки?",
  "kvartiry": "Нужна помощь с выбором квартиры?",
  zagorodnaya: "Нужна помощь с выбором загородной недвижимости?",
  "kommercheskaya-nedvizhimost": "Нужна помощь с выбором коммерческой недвижимости?",
};

function getCatalogLeadTitle(slug: string) {
  return CATALOG_LEAD_TITLES[slug] ?? CATALOG_LEAD_TITLES["nedvizhimost"];
}

function hasNonPaginationCatalogQuery(query: CatalogQuery) {
  return Object.entries(query).some(([key, value]) => key !== "page" && value !== undefined);
}

function buildCorporateBreadcrumbs(page: CorporatePageConfig): BreadcrumbItem[] {
  const current = { label: page.navLabel || page.heroTitle };
  const catalogParent = CATALOG_BREADCRUMB_PARENTS[page.slug];

  if (catalogParent) {
    return [
      { label: "Главная", href: "/" },
      { label: "Недвижимость", href: "/nedvizhimost" },
      ...catalogParent,
      current,
    ];
  }

  const serviceParent = SERVICE_PAGE_SLUGS.has(page.slug);
  if (serviceParent) {
    return [{ label: "Главная", href: "/" }, { label: "Сервисы" }, current];
  }

  const companyParent = COMPANY_PAGE_SLUGS.has(page.slug);
  if (companyParent) {
    return [{ label: "Главная", href: "/" }, { label: "Компания" }, current];
  }

  return [{ label: "Главная", href: "/" }, current];
}

const CATALOG_BREADCRUMB_PARENTS: Record<string, BreadcrumbItem[]> = {
  "nedvizhimost": [],
  novostroyki: [],
  "kvartiry": [],
  "odnokomnatnye-kvartiry": [{ label: "Квартиры", href: "/kvartiry" }],
  "dvuhkomnatnye-kvartiry": [{ label: "Квартиры", href: "/kvartiry" }],
  "trehkomnatnye-kvartiry": [{ label: "Квартиры", href: "/kvartiry" }],
  "kvartiry-studii": [{ label: "Квартиры", href: "/kvartiry" }],
  "vtorichnoe-zhile": [{ label: "Квартиры", href: "/kvartiry" }],
  zagorodnaya: [],
  "doma": [{ label: "Загородная", href: "/zagorodnaya" }],
  "zemelnye-uchastki": [{ label: "Загородная", href: "/zagorodnaya" }],
  "kottedzhnye-poselki": [{ label: "Загородная", href: "/zagorodnaya" }],
  stroitelstvo: [{ label: "Загородная", href: "/zagorodnaya" }],
  "kommercheskaya-nedvizhimost": [],
  ofisy: [{ label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" }],
  "torgovye-pomeshcheniya": [{ label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" }],
  sklady: [{ label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" }],
  "gotovyy-biznes": [{ label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" }],
  "svobodnoe-naznachenie": [{ label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" }],
};

const SERVICE_PAGE_SLUGS = new Set([
  "ipoteka",
  "prodazha-nedvizhimosti",
  "bezopasnaya-sdelka",
  "yurist",

  "rieltor",
]);

const COMPANY_PAGE_SLUGS = new Set(["o-kompanii", "otzyvy", "rabota-rieltorom", "kontakty"]);

function CorporatePrimaryCta({
  page,
  className,
  showIcon = true,
}: {
  page: CorporatePageConfig;
  className: string;
  showIcon?: boolean;
}) {
  if (page.slug === "rabota-rieltorom") {
    return <CareersQuizButton className={className} showIcon={showIcon} />;
  }

  if (page.primaryCta.href.startsWith("tel:")) {
    return (
      <Link href={page.primaryCta.href} className={className}>
        {page.primaryCta.label}
        {showIcon ? <ArrowRight className="size-4" aria-hidden /> : null}
      </Link>
    );
  }

  return (
    <RequestModalButton type="button" variant="plain" request={getPrimaryCtaRequest(page)} className={className}>
      {page.primaryCta.label}
      {showIcon ? <ArrowRight className="" aria-hidden /> : null}
    </RequestModalButton>
  );
}

function getPrimaryCtaRequest(page: CorporatePageConfig) {
  return {
    title: page.requestModalTitle ?? page.primaryCta.label,
    subtitle: `${page.microtext} Оставьте контакты - специалист агентства недвижимости уточнит детали и предложит следующий шаг.`,
    source: `corporate:${page.slug}:hero`,
    formType: page.requestModalFormType ?? `corporate_${page.slug.replace(/-/g, "_")}`,
  };
}
