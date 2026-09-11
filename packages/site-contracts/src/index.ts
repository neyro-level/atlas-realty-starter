export type SiteEngineMode = "fixture" | "payload";

export type SiteIdentity = {
  brand: string;
  legalName: string | null;
  projectName: string;
  tagline: string;
  city: {
    nominative: string;
    genitive: string;
    prepositional: string;
    slug: string;
  };
  domain: string;
  indexable: boolean;
  expert: {
    name: string;
    role: string;
    portrait: string;
  };
  contacts: {
    phone: string | null;
    email: string | null;
    address: string | null;
    hours: string | null;
  };
  social: {
    telegram: string | null;
    max: string | null;
    vk: string | null;
  };
  legal: {
    name: string | null;
    inn: string | null;
    registrationNumber: string | null;
  };
};

export type SiteProfile = SiteIdentity & {
  logo: {
    mark: string;
    wordmark: string | null;
    favicon: string;
    socialPreview: string;
  };
  media: {
    catalogMortgageService: string;
  };
  seo: {
    title: string;
    description: string;
  };
  theme: {
    preset: string;
    primary: string;
    primaryHover: string;
  };
  map: {
    provider: "yandex";
    center: readonly [latitude: number, longitude: number];
    zoom: number;
    catalogZoom: number;
  };
  features: {
    catalogMap: boolean;
    mediaGallery: boolean;
    requests: boolean;
  };
};

export type PublicContactDto = {
  phone: string;
  phoneHref: string;
  secondaryPhone: string | null;
  email: string;
  emailHref: string;
  officeAddress: string;
  hours: string;
  useSharedEmployeePhone: boolean;
  employeePhone: string | null;
  hidePropertyHouseNumbers: boolean;
  callbackHref: string;
  callbackLabel: string;
  telegram?: string;
  max?: string;
  vk?: string;
};

export type PublicOfficeDto = {
  id: string;
  title: string;
  address: string;
  mapUrl: string;
  photoUrl: string | null;
};

export type RequestAvatarDto = {
  label: string;
  src: string;
};

export type PropertyCategory =
  | "flat"
  | "house"
  | "land"
  | "commercial"
  | "construction"
  | "garage"
  | "room"
  | "other";

export type PropertyCardDto = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryKey: PropertyCategory;
  dealType?: "sale" | "rent";
  origin?: "XML" | "MANUAL" | null;
  status?: string;
  isPublished?: boolean;
  price: number | null;
  address: string;
  city: string | null;
  citySlug: string | null;
  rooms: number | null;
  isStudio?: boolean;
  area: number | null;
  areaLiving?: number | null;
  areaKitchen?: number | null;
  floor: number | null;
  floorsTotal: number | null;
  builtYear?: number | null;
  buildingType?: string | null;
  renovation?: string | null;
  houseType?: string | null;
  lotAreaSotka?: number | null;
  landCategory?: string | null;
  landUseType?: string | null;
  cadastralNumber?: string | null;
  ceilingHeight?: number | null;
  hasHeating?: boolean | null;
  commercialType?: string | null;
  commercialBuildingType?: string | null;
  entranceType?: string | null;
  district: string | null;
  districtSlug: string | null;
  agentId: string | null;
  agentName: string | null;
  agentPhotoUrl?: string | null;
  image: string | null;
  images: string[];
  layoutImageUrl?: string | null;
  videoUrl?: string | null;
  videoUrls?: string[];
  updatedAt: string;
  lastModified?: string | null;
  lastSeenAt?: string | null;
  unpublishedAt?: string | null;
  objectCode?: string | null;
  description?: string | null;
  h1?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isFeatured?: boolean;
  isPromoted?: boolean;
  isExclusive?: boolean;
};

export type PropertyDetailDto = PropertyCardDto & {
  description: string;
  features: Array<{ label: string; value: string }>;
};

export type PropertyDetailIcon = "area" | "living-area" | "kitchen" | "floor" | "rooms";

export type PropertyDetailSummaryItemDto = {
  icon: PropertyDetailIcon;
  label: string;
  value: string;
};

export type PropertyDetailRowDto = {
  label: string;
  value: string;
};

export type PropertyGalleryDto = {
  images: string[];
  videoUrls: string[];
  imageAlt: string;
  address: string;
  mapUrl: string;
};

export type PropertyViewingDateDto = {
  value: string;
  label: string;
  dateLabel: string;
};

export type PropertyRelatedItemDto = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  address: string;
  image: string | null;
  imageAlt: string;
  facts: string[];
};

export type HouseProjectPreviewDto = {
  id: string;
  slug: string;
  numberLabel: string;
  areaLabel: string;
  title: string;
  description: string;
  backHref: string;
};

export type NewBuildingMediaDto = {
  src: string | null;
  alt: string;
  sourceUrl?: string | null;
};

export type NewBuildingLayoutDto = {
  id: string;
  label: string;
  areaFrom: number | null;
  areaTo: number | null;
  priceFrom: number | null;
  image: NewBuildingMediaDto | null;
};

export type NewBuildingDetailDto = {
  sourceId: string | null;
  slug: string;
  name: string;
  shortName: string;
  positioning: string;
  address: string;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  developerName: string;
  completionLabel: string | null;
  classLabel: string | null;
  buildingsLabel: string | null;
  apartmentsLabel: string | null;
  floorsLabel: string | null;
  priceFrom: number | null;
  areaFrom: number | null;
  areaTo: number | null;
  formats: string[];
  mortgageLabel: string | null;
  gallery: NewBuildingMediaDto[];
  videoUrl: string | null;
  about: {
    intro: string;
    features: Array<{ title: string; text: string }>;
  };
  layouts: NewBuildingLayoutDto[];
  purchaseOptions: Array<{ title: string; text: string; value: string | null }>;
  location: {
    intro: string;
    items: Array<{ title: string; text: string; timeLabel: string | null }>;
  };
  whyAgency: Array<{ title: string; text: string }>;
  related: NewBuildingDto[];
};

export type ArticleDocumentBlockDto =
  | { type: "paragraph"; text: string }
  | { type: "list"; style: "bullets" | "checklist"; items: string[] }
  | { type: "callout"; title: string; style: "note" | "checklist"; body: string[] };

export type ArticleDocumentSectionDto = {
  title: string;
  blocks: ArticleDocumentBlockDto[];
};

export type ArticleFaqItemDto = {
  question: string;
  answer: string;
};

export type ArticleDocumentCtaDto = {
  title: string;
  text: string;
  label: string;
  href: string;
};

export type ArticleDocumentDto = {
  rubric: string | null;
  lead: string | null;
  sections: ArticleDocumentSectionDto[];
  faq: ArticleFaqItemDto[];
  cta: ArticleDocumentCtaDto | null;
};

export type ArticleDto = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  document?: ArticleDocumentDto | null;
};

export type JournalCategoryLinkDto = {
  slug: string;
  title: string;
  href: string;
  active?: boolean;
};

export type JournalArticleCardDto = {
  id: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  image: string;
  dateLabel: string;
  topicLabel: string;
};

export type JournalLinkDto = {
  label: string;
  href: string;
  description?: string;
};

export type JournalHubSectionDto = {
  id: string;
  title: string;
  action: JournalLinkDto;
  articles: JournalArticleCardDto[];
  emptyText?: string;
};

export type JournalHubPageDto = {
  query: string;
  categories: JournalCategoryLinkDto[];
  popular: JournalArticleCardDto[];
  sections: JournalHubSectionDto[];
  newBuildings: PropertyCardDto[];
  interests: JournalLinkDto[];
};

export type JournalCategoryPageDto = {
  category: JournalCategoryLinkDto;
  categories: JournalCategoryLinkDto[];
  h1: string;
  lead: string;
  primaryArticles: JournalArticleCardDto[];
  featuredArticle: JournalArticleCardDto | null;
  moreArticles: JournalArticleCardDto[];
  offer: {
    title: string;
    action: JournalLinkDto;
    items: PropertyCardDto[];
  } | null;
  consultation: {
    title: string;
    text: string;
    buttonLabel: string;
    modalTitle: string;
    modalSubtitle: string;
    source: string;
  };
};

export type JournalArticleAuthorDto = {
  name: string;
  role: string;
  image: string | null;
};

export type JournalArticleMediaDto = {
  src: string;
  alt: string;
  caption?: string | null;
  frameClassName?: string;
  objectClassName?: string;
};

export type JournalArticleSectionDto = {
  id: string;
  title: string;
  blocks: ArticleDocumentBlockDto[];
  media?: JournalArticleMediaDto | null;
  galleryAfter?: number | null;
};

export type JournalArticlePageDto = {
  article: ArticleDto;
  topicLabel: string;
  dateLabel: string;
  readingTimeLabel: string;
  author: JournalArticleAuthorDto;
  cover: JournalArticleMediaDto;
  lead: string;
  contents: Array<{ id: string; title: string }>;
  sections: JournalArticleSectionDto[];
  gallery: JournalArticleMediaDto[];
  galleryBeforeBody: boolean;
  galleryAfterSectionIndex: number | null;
  faq: ArticleFaqItemDto[];
  cta: ArticleDocumentCtaDto | null;
  ctaImage: string | null;
  editorialLinks: JournalLinkDto[];
  footerLinks: JournalLinkDto[];
  showcase: {
    action: JournalLinkDto;
    items: PropertyCardDto[];
    afterSectionIndex: number;
    insideSection: boolean;
  } | null;
  relatedArticles: JournalArticleCardDto[];
  relatedProperties: PropertyCardDto[];
  relatedNewBuildings: PropertyCardDto[];
};

export type EmployeeDto = {
  id: string;
  slug: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  photo: string | null;
  bio: string;
};

export type EmployeeCardDto = {
  id: string;
  slug: string;
  name: string;
  role: string;
  phone: string | null;
  photo: string | null;
};

export type ReviewDto = {
  id: string;
  author: string;
  text: string;
  rating: number;
  publishedAt: string;
};

export type EmployeeTeamKeyDto = "sales" | "support" | "office";

export type EmployeeDirectoryTabDto = {
  value: EmployeeTeamKeyDto;
  label: string;
  description: string;
  href: string;
  count: number;
  active: boolean;
};

export type EmployeeDirectoryPageDto = {
  title: string;
  titleLines: string[];
  description: string;
  heroImage: string;
  query: string;
  activeTab: { label: string; description: string };
  tabs: EmployeeDirectoryTabDto[];
  total: number;
  page: number;
  pageLinks: Array<{ label: string; href: string; current: boolean }>;
};

export type EmployeeProfileReviewDto = {
  id: string;
  publicName: string;
  rating: number;
  text: string;
  publishedAt: string;
  dateLabel: string;
};

export type EmployeeProfilePageDto = {
  path: string;
  employee: {
    id: string;
    slug: string;
    fullName: string;
    position: string;
    bio: string;
    objectCount: number;
    reviewCount: number;
    rating: number | null;
  };
  showsObjects: boolean;
  showsReviews: boolean;
  reviews: EmployeeProfileReviewDto[];
  reviewPageLinks: Array<{ label: string; href: string; current: boolean }>;
  categoryFilters: Array<{ label: string; href: string; active: boolean }>;
  listingPageLinks: Array<{ label: string; href: string; current: boolean }>;
};

export type EmployeeReviewDirectoryItemDto = EmployeeProfileReviewDto & {
  employee: { slug: string; fullName: string; position: string; photoUrl: string | null };
};

export type EmployeeReviewsPageDto = {
  items: EmployeeReviewDirectoryItemDto[];
  total: number;
  page: number;
  pageCount: number;
  preview: boolean;
  previousHref: string | null;
  nextHref: string | null;
};

export type ContactsPageDto = {
  title: string;
  serviceLabel: string;
  contacts: PublicContactDto;
  offices: PublicOfficeDto[];
  mapTitle: string;
  mapSrc: string | null;
};

export type CorporateHeroIconKeyDto = "building" | "calculation" | "protection";

export type CorporateHeroCardDto = {
  title: string;
  text: string;
  icon?: CorporateHeroIconKeyDto;
};

export type CorporateRelatedServiceDto = {
  label: string;
  href: string;
  description: string;
};

export type CorporateArticlePreviewDto = {
  slug: string;
  title: string;
  excerpt: string;
};

export type CorporateLandingPageDto = {
  slug: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  microtext: string;
  heroCards: CorporateHeroCardDto[];
  relatedServices: CorporateRelatedServiceDto[];
  relatedArticles: CorporateArticlePreviewDto[];
  genericHeroImage: string;
  hasSecondaryCatalogIntro: boolean;
  usesCatalogHero: boolean;
};

export type NewBuildingDto = {
  id: string;
  slug: string;
  title: string;
  address: string;
  priceFrom: number | null;
  completion: string;
  image: string | null;
  developerName?: string;
  floorsLabel?: string | null;
};

export type SeoDocumentDto = {
  path: string;
  title: string;
  description: string;
  h1: string;
  indexable: boolean;
};

export type SitemapEntryDto = {
  path: string;
  lastModified: string;
  priority: number;
};

export type SiteNavLinkDto = {
  label: string;
  href: string;
  external?: boolean;
  rel?: string;
  description?: string;
};

export type SiteHeaderMegaSectionDto = {
  title: string;
  href: string;
  description?: string;
  links: SiteNavLinkDto[];
};

export type SiteHeaderNavItemDto = SiteNavLinkDto & {
  matchPrefixes?: string[];
  showOverviewLink?: boolean;
  children?: SiteNavLinkDto[];
  megaSections?: SiteHeaderMegaSectionDto[];
};

export type SiteFooterColumnDto = {
  title: string;
  links: SiteNavLinkDto[];
};

export type SiteFooterMetaDto = {
  tagline: string;
  copyright: string;
  registry: string;
  disclaimer: string;
  disclaimerHref: string;
};

export type SiteSocialLinkDto = {
  label: string;
  href: string;
};

export type LegalDocumentSectionDto = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocumentDto = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  version: string;
  updatedAt: string;
  intro: string[];
  sections: LegalDocumentSectionDto[];
};

export type PublicFormFieldErrorsDto = Record<string, string | undefined>;

export type PublicFormResultDto = {
  ok: boolean;
  message: string;
  fieldErrors?: PublicFormFieldErrorsDto;
};

export type HomePageDto = {
  featured: {
    title: string;
    price: string;
    note: string;
    href: string;
    image: string | null;
  };
  latestFlats: PropertyCardDto[];
  latestCountry: PropertyCardDto[];
  articles: ArticleDto[];
};

export type CatalogQueryDto = {
  q?: string;
  city?: string;
  district?: string;
  category?: string;
  dealType?: CatalogDealTypeDto;
  rooms?: number | number[];
  studio?: boolean;
  exclusive?: boolean;
  priceFrom?: number;
  priceTo?: number;
  areaFrom?: number;
  areaTo?: number;
  kitchenFrom?: number;
  floorFrom?: number;
  floorTo?: number;
  lotAreaFrom?: number;
  lotAreaTo?: number;
  buildingType?: string;
  renovation?: string;
  landUseType?: string;
  hasElectricity?: boolean;
  hasGas?: boolean;
  hasWater?: boolean;
  hasSewerage?: boolean;
  commercialType?: string;
  commercialBuildingType?: string;
  entranceType?: string;
  sort?: CatalogSortDto;
  view?: CatalogViewDto;
  limit?: number;
  page?: number;
};

export type CatalogDealTypeDto = "sale" | "rent";
export type CatalogViewDto = "grid" | "list" | "map";
export type CatalogSortDto = "recommended" | "newest" | "price_asc" | "price_desc" | "area_desc";

export type CatalogCategoryDto = {
  label: string;
  value: PropertyCategory | "all";
  count: number;
};

export type CatalogFacetOptionDto = {
  label: string;
  value: string;
  count?: number;
  parent?: string | null;
};

export type CatalogFacetsDto = {
  cities: CatalogFacetOptionDto[];
  districts: CatalogFacetOptionDto[];
  rooms: Array<{ value: number; count?: number }>;
  price: { min: number | null; max: number | null };
  buildingTypes: CatalogFacetOptionDto[];
  renovations: CatalogFacetOptionDto[];
  landUseTypes: CatalogFacetOptionDto[];
  commercialTypes: CatalogFacetOptionDto[];
  commercialBuildingTypes: CatalogFacetOptionDto[];
  entranceTypes: CatalogFacetOptionDto[];
};

export type CatalogSnapshotDto = {
  generatedAt: string;
  total: number;
  categories: CatalogCategoryDto[];
  facets: CatalogFacetsDto;
  listings: PropertyCardDto[];
  source: "live" | "fallback";
  appliedQuery: CatalogQueryDto;
};

export type CatalogPageDto = {
  total: number;
  items: PropertyCardDto[];
  query: CatalogQueryDto;
};

export type SiteShellDto = {
  identity: SiteIdentity;
  contacts: PublicContactDto;
  requestAvatars: RequestAvatarDto[];
};

export type SitemapLinkDto = {
  href: string;
  label: string;
  countAsPublishedPage?: boolean;
  emphasis?: boolean;
};

export type SitemapColumnDto = {
  title?: string;
  items: SitemapLinkDto[];
};

export type SitemapSectionDto = {
  title: string;
  columns: SitemapColumnDto[];
  count?: number;
  grouped?: boolean;
};

export type HtmlSitemapPageDto = {
  metrics: { totalPages: number; staticPages: number; objectPages: number };
  sections: SitemapSectionDto[];
};

export type SitemapListingItemDto = { id: string; slug: string; title: string };

export type SitemapListingPageDto = {
  kind: "objects" | "reserve";
  page: number;
  pageSize: number;
  total: number;
  items: SitemapListingItemDto[];
};

export type SessionCollectionItemDto = {
  id: string;
  slug: string;
  path: string;
  title: string;
  price: number | null;
  address: string;
  category: string;
  categoryKey: string;
  rooms: number | null;
  area: number | null;
  areaLiving?: number | null;
  areaKitchen?: number | null;
  floor: number | null;
  floorsTotal: number | null;
  builtYear?: number | null;
  buildingType?: string | null;
  renovation?: string | null;
  image: string | null;
  images?: string[];
  objectCode: string | null;
  isExclusive?: boolean;
};

export type SessionCollectionGroupDto = {
  key: string;
  label: string;
  count: number;
};

export type LeadgenPromoApartmentDto = { id:string; image:string; images?:readonly string[]; facts:readonly (readonly [string,string])[]; price:string };
export type LeadgenPromoNewBuildingExampleDto = { id:string; name:string; district:string; benefit:string; mortgage:string; completion:string; priceFrom:string; image:string; imageAlt:string };
export type LeadgenPromoConstructionExampleDto = { id:string; material:string; area:string; buildTime:string; priceFrom:string; image:string; imageAlt:string };
export type LeadgenQuizStepDto = { key:string; label:string; question:string; options:readonly string[] };
export type LeadgenPromoContentDto = {
  formPrefix:string; route:string; title:string; description:string; heroBackgroundImage:string;
  hideAfterRequest?:boolean; hideBaseSection?:boolean; hideBonusSection?:boolean; hideStandardExamples?:boolean; hideFinalCta?:boolean;
  hero:{eyebrow:string;h1:string;h1Accent?:string;subtitle?:string;cta:string;microtext:string;modalTitle:string;modalSubtitle:string;badge?:string};
  afterRequestTitle:string;
  baseSection:{title:string;accentTitle?:string;subtitle:string;badge?:string;points:readonly (string|{readonly title:string;readonly text:string})[];preview?:{variant:"apartments"|"expert";label:string;city:string;countLabel:string;image?:string}};
  phone:string;phoneHref:string;hours:string;headerTrust:{value:string;label:string};headerRequest?:{subtitle:string;message:string};mobileMenuText?:string;
  manager:{name:string;role:string;photo:string;photoFit?:"cover"|"contain"};
  quiz:{title:string;expertText:string;expertNote:string;questionHint:string;finalTitle:string;finalText:string;successText:string;submitLabel:string;loadingLabel:string;formType?:string;messageIntro:string;errors:{noAnswer:string;name:string;phone:string;consent:string;delay:string};fields:{nameLabel:string;namePlaceholder:string;phoneLabel:string;phonePlaceholder:string};steps:readonly LeadgenQuizStepDto[]};
  phoneMockup:string;examplesTitle:string;trustItems:readonly {title:string;text:string;icon?:"home"|"banknote"|"shield"|"clipboardList"|"badgePercent"|"landmark"}[];baseIncludes:readonly string[];bonusItems:readonly string[];
  bonusSection?:{title:string;formTitle:string;submitLabel:string;message:string};
  finalCta?:{title:string;image:string;imageAlt:string;bullets:readonly {text:string;icon:"check"|"clock"}[];microtext:string;cta:string;modalTitle:string;formType:string;source:string};
  apartments:readonly LeadgenPromoApartmentDto[];newBuildingExamples?:readonly LeadgenPromoNewBuildingExampleDto[];constructionExamples?:readonly LeadgenPromoConstructionExampleDto[];footerOffices:readonly string[];
};

export interface SiteEngine {
  readonly mode: SiteEngineMode;
  getShell(): Promise<SiteShellDto>;
  getHomePage(): Promise<HomePageDto>;
  getCatalog(query?: CatalogQueryDto): Promise<CatalogPageDto>;
  getProperty(slug: string): Promise<PropertyDetailDto | null>;
  getNewBuildings(): Promise<NewBuildingDto[]>;
  getNewBuildingCards(): Promise<PropertyCardDto[]>;
  getEmployees(): Promise<EmployeeDto[]>;
  getEmployee(slug: string): Promise<EmployeeDto | null>;
  getArticles(): Promise<ArticleDto[]>;
  getArticle(slug: string): Promise<ArticleDto | null>;
  getReviews(): Promise<ReviewDto[]>;
  getOffices(): Promise<PublicOfficeDto[]>;
  getSeoDocuments(): Promise<SeoDocumentDto[]>;
  getSitemap(): Promise<SitemapEntryDto[]>;
}
