import 'server-only'

import type {
  ArticleDto,
  CatalogPageDto,
  CatalogQueryDto,
  EmployeeDto,
  HomePageDto,
  NewBuildingDto,
  PropertyCardDto,
  PropertyCategory,
  PropertyDetailDto,
  SiteEngine,
} from '@starter/site-contracts'

import type { PublicCatalogQuery } from '@/core/query/public-api'
import {
  getPublicAgents,
  getPublicCatalog,
  getPublicComplexes,
  getPublicPosts,
  getPublicPropertyBySlug,
} from '@/project/public-gateway'
import { siteIdentity } from '@/project/site-identity'
import type { PublicContentDocument, PublicProperty, PublicPropertyDetails } from '@/shared/types/public-content'

export const payloadSiteEngine: SiteEngine = {
  mode: 'payload',

  async getShell() {
    const phone = siteIdentity.contacts.phone ?? ''
    const email = siteIdentity.contacts.email ?? ''
    return {
      identity: siteIdentity,
      contacts: {
        phone,
        phoneHref: phone ? `tel:${phone.replace(/[^+\d]/gu, '')}` : '',
        secondaryPhone: null,
        email,
        emailHref: email ? `mailto:${email}` : '',
        officeAddress: siteIdentity.contacts.address ?? 'Адрес настраивается перед публикацией',
        hours: siteIdentity.contacts.hours ?? 'Время работы настраивается',
        useSharedEmployeePhone: false,
        employeePhone: null,
        hidePropertyHouseNumbers: false,
        callbackHref: phone ? `tel:${phone.replace(/[^+\d]/gu, '')}` : '',
        callbackLabel: 'Оставить заявку',
        telegram: siteIdentity.social.telegram ?? undefined,
        max: siteIdentity.social.max ?? undefined,
        vk: siteIdentity.social.vk ?? undefined,
      },
      requestAvatars: [{ label: siteIdentity.expert.name, src: siteIdentity.expert.portrait }],
    }
  },

  async getHomePage(): Promise<HomePageDto> {
    const [flats, country, posts] = await Promise.all([
      getPublicCatalog({ category: 'apartment', limit: 8, page: 1, sort: 'newest' }),
      getPublicCatalog({ category: 'house', limit: 8, page: 1, sort: 'newest' }),
      getPublicPosts(),
    ])
    const latestFlats = flats.docs.map(toPropertyCard)
    const latestCountry = country.docs.map(toPropertyCard)
    const featured = latestCountry[0] ?? latestFlats[0]
    return {
      featured: featured
        ? { title: featured.title, price: formatRubles(featured.price), note: 'Проверка документов и сопровождение', href: `/obekty/${featured.slug}`, image: featured.image }
        : { title: 'Подбор недвижимости', price: 'По запросу', note: 'Проверка документов и сопровождение', href: '/nedvizhimost', image: '/images/agency-home-houses.jpg' },
      latestFlats,
      latestCountry,
      articles: posts.slice(0, 4).map(toArticle),
    }
  },

  async getCatalog(query: CatalogQueryDto = {}): Promise<CatalogPageDto> {
    const category = toPublicCategory(query.category)
    if (query.category && !category) return { total: 0, items: [], query }
    const result = await getPublicCatalog({
      ...category ? { category } : {},
      ...query.dealType ? { dealType: query.dealType } : {},
      ...query.district ? { district: query.district } : {},
      ...query.q ? { q: query.q } : {},
      ...query.priceFrom !== undefined ? { priceMinMinor: Math.round(query.priceFrom * 100) } : {},
      ...query.priceTo !== undefined ? { priceMaxMinor: Math.round(query.priceTo * 100) } : {},
      ...query.areaFrom !== undefined ? { areaMinCm2: Math.round(query.areaFrom * 10_000) } : {},
      ...query.areaTo !== undefined ? { areaMaxCm2: Math.round(query.areaTo * 10_000) } : {},
      ...firstRoom(query.rooms) !== undefined ? { rooms: firstRoom(query.rooms) } : {},
      limit: Math.min(query.limit ?? 24, 50),
      page: query.page ?? 1,
      sort: toPublicSort(query.sort),
    })
    return { total: result.totalDocs, items: result.docs.map(toPropertyCard), query }
  },

  async getProperty(slug: string): Promise<PropertyDetailDto | null> {
    const property = await getPublicPropertyBySlug(slug)
    return property ? toPropertyDetail(property) : null
  },

  async getNewBuildings(): Promise<NewBuildingDto[]> {
    const result = await getPublicComplexes({ limit: 50, page: 1 })
    return result.docs.map((complex) => ({
      id: complex.id,
      slug: complex.slug,
      title: complex.name,
      address: complex.address ?? complex.district ?? '',
      priceFrom: null,
      completion: readinessLabel(complex.readiness),
      image: complex.images[0]?.src ?? null,
    }))
  },

  async getNewBuildingCards() {
    return (await this.getNewBuildings()).map((complex) => ({
      id: complex.id, slug: complex.slug, title: complex.title, category: 'Новостройки', categoryKey: 'other' as const,
      dealType: 'sale' as const, price: complex.priceFrom, address: complex.address, city: null, citySlug: null,
      rooms: null, area: null, floor: null, floorsTotal: null, district: null, districtSlug: null,
      agentId: null, agentName: null, image: complex.image, images: complex.image ? [complex.image] : [], updatedAt: new Date(0).toISOString(),
    }))
  },

  async getEmployees(): Promise<EmployeeDto[]> {
    return (await getPublicAgents()).map((agent) => ({
      id: agent.id, slug: agent.slug, name: agent.name, role: agent.position ?? 'Специалист по недвижимости',
      phone: agent.phone ?? null, email: agent.email ?? null, photo: agent.image?.src ?? null, bio: agent.bio,
    }))
  },

  async getEmployee(slug: string) {
    return (await this.getEmployees()).find((employee) => employee.slug === slug) ?? null
  },

  async getArticles(): Promise<ArticleDto[]> {
    return (await getPublicPosts()).map(toArticle)
  },

  async getArticle(slug: string) {
    return (await this.getArticles()).find((article) => article.slug === slug) ?? null
  },

  async getReviews() { return [] },
  async getOffices() { return [] },
  async getSeoDocuments() { return [] },
  async getSitemap() { return [] },
}

function toPropertyCard(property: PublicProperty): PropertyCardDto {
  const categoryKey = toUiCategory(property.category)
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    category: categoryLabel(categoryKey),
    categoryKey,
    dealType: property.dealType,
    status: property.status,
    isPublished: true,
    price: property.priceMinorUnits / 100,
    address: property.address,
    city: siteIdentity.city.nominative,
    citySlug: siteIdentity.city.slug,
    rooms: property.rooms ?? null,
    area: property.totalAreaCm2 / 10_000,
    floor: property.floor ?? null,
    floorsTotal: property.floorsTotal ?? null,
    district: property.district ?? null,
    districtSlug: property.district ? slugify(property.district) : null,
    agentId: property.agentId ?? null,
    agentName: null,
    image: property.images[0]?.src ?? null,
    images: property.images.map((image) => image.src),
    updatedAt: property.updatedAt,
    description: property.description,
    seoTitle: property.seo.title,
    seoDescription: property.seo.description ?? null,
  }
}

function toPropertyDetail(property: PublicPropertyDetails): PropertyDetailDto {
  const card = toPropertyCard(property)
  const features = [
    property.rooms !== undefined ? { label: 'Комнат', value: String(property.rooms) } : null,
    { label: 'Площадь', value: `${formatNumber(property.totalAreaCm2 / 10_000)} м²` },
    property.floor !== undefined ? { label: 'Этаж', value: property.floorsTotal ? `${property.floor} из ${property.floorsTotal}` : String(property.floor) } : null,
  ].filter((item): item is { label: string; value: string } => item !== null)
  return { ...card, videoUrl: property.videoUrl ?? null, description: property.description, features }
}

function toArticle(post: PublicContentDocument): ArticleDto {
  return {
    id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt ?? null,
    content: lexicalText(post.content), coverImage: post.seo.image?.src ?? null,
    publishedAt: post.publishedAt ?? null, updatedAt: post.updatedAt,
    seoTitle: post.seo.title, seoDescription: post.seo.description ?? null,
  }
}

function toPublicCategory(value?: string): PublicCatalogQuery['category'] {
  if (value === 'flat' || value === 'room') return 'apartment'
  if (value === 'house') return 'house'
  if (value === 'land') return 'land'
  if (value === 'commercial') return 'commercial'
  if (value === 'garage') return 'parking'
  return undefined
}

function toUiCategory(value: PublicProperty['category']): PropertyCategory {
  if (value === 'apartment') return 'flat'
  if (value === 'house' || value === 'townhouse') return 'house'
  if (value === 'land') return 'land'
  if (value === 'commercial') return 'commercial'
  if (value === 'parking') return 'garage'
  return 'other'
}

function toPublicSort(value?: CatalogQueryDto['sort']): PublicCatalogQuery['sort'] {
  if (value === 'price_asc') return 'price-asc'
  if (value === 'price_desc') return 'price-desc'
  if (value === 'area_desc') return 'area-desc'
  return 'newest'
}

function firstRoom(value?: number | number[]) { return Array.isArray(value) ? value[0] : value }
function categoryLabel(value: PropertyCategory) { return ({ flat: 'Квартира', room: 'Комната', house: 'Дом', land: 'Участок', commercial: 'Коммерческая недвижимость', construction: 'Строительство', garage: 'Гараж', other: 'Недвижимость' } as const)[value] }
function readinessLabel(value?: 'commissioned' | 'construction' | 'planned') { return value === 'commissioned' ? 'Сдан' : value === 'construction' ? 'Строится' : value === 'planned' ? 'Запланирован' : 'Срок уточняется' }
function formatRubles(value: number | null) { return value === null ? 'По запросу' : `${new Intl.NumberFormat('ru-RU').format(value)} ₽` }
function formatNumber(value: number) { return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value) }
function slugify(value: string) { return value.toLocaleLowerCase('ru-RU').replace(/[^a-zа-яё0-9]+/giu, '-').replace(/^-|-$/g, '') }
function lexicalText(value: unknown): string | null {
  const parts: string[] = []
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    if ('text' in node && typeof node.text === 'string') parts.push(node.text)
    if ('children' in node && Array.isArray(node.children)) node.children.forEach(visit)
    if ('root' in node) visit(node.root)
  }
  visit(value)
  return parts.length ? parts.join(' ') : null
}
