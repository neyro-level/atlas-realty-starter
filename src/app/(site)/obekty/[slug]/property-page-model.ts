import type {
  PropertyDetailDto,
  PropertyDetailRowDto,
  PropertyDetailSummaryItemDto,
  PropertyRelatedItemDto,
} from '@starter/site-contracts'

import type { CatalogQuery } from '@/lib/catalog'
import { formatPrice } from '@/lib/catalog'
import { resolvePropertyRobotsState } from '@/modules/catalog/seo'
import { truncateSeoText } from '@/modules/seo/metadata'
import { getPropertyPath, isIndexable, siteConfig } from '@/project/site-config'
import { tenant } from '@/project/tenant.config'
import { splitBlurredAddress } from '@/shared/lib/property-address-blur'
import { getSiteEngine } from '@/site-engine'

export type PropertyListing = PropertyDetailDto
export type ObjectBreadcrumbItem = { href?: string; label: string }

export const OBJECT_METADATA_TITLE_MAX_LENGTH = 90
export const OBJECT_METADATA_DESCRIPTION_MAX_LENGTH = 160
const OBJECT_METADATA_DISCRIMINATOR_MAX_LENGTH = 28

export function buildObjectSeoTitle(
  listing: PropertyListing,
  { hideHouseNumber = false }: { hideHouseNumber?: boolean } = {},
) {
  const action = listing.dealType === 'rent' ? 'Сдаётся' : 'Продаётся'
  const city = listing.city ?? 'Краснодаре'
  const cityPhrase = city.toLowerCase().includes('город') ? 'в Краснодаре' : `в ${city}`
  const category = buildSeoCategoryLabel(listing)
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : ''
  const address = buildSeoAddressLabel(listing, hideHouseNumber)
  const main = `${action} ${category}${area} ${cityPhrase}`
  const discriminator = buildObjectTitleDiscriminator(listing, address)

  return {
    address,
    baseTitle: buildObjectMetadataBaseTitle(main, discriminator),
    h1: [main, address].filter(Boolean).join(', '),
    main,
  }
}

export function buildObjectMetaDescription(
  listing: PropertyListing,
  generatedTitle = buildObjectSeoTitle(listing),
) {
  const price = listing.price ? `Цена: ${formatPrice(listing.price)}.` : null
  const address = generatedTitle.address ?? compactAddress(listing.address)
  const benefit =
    listing.dealType === 'rent'
      ? '«АТЛАС» уточнит условия аренды, проверит документы и организует просмотр.'
      : '«АТЛАС» проверит документы, поможет с оформлением ипотеки и торгом.'

  return [`${generatedTitle.main}.`, price, benefit, address ? `Адрес: ${address}.` : null]
    .filter(Boolean)
    .join(' ')
}

export function buildDetailsHeading(listing: PropertyListing) {
  if (listing.categoryKey === 'house') return 'О доме'
  if (listing.categoryKey === 'land') return 'Об участке'
  if (listing.categoryKey === 'commercial') return 'Об объекте'
  if (listing.categoryKey === 'construction') return 'О проекте'
  return 'О квартире'
}

export function buildRelatedPropertyItem(listing: PropertyListing): PropertyRelatedItemDto {
  const href = getPropertyPath(listing.slug)
  const title = buildObjectSummaryTitle(listing)
  const address =
    listing.district && listing.district !== listing.city ? listing.district : listing.address
  const facts = [
    listing.area ? `${formatNumber(listing.area)} м²` : null,
    listing.floor || listing.floorsTotal
      ? `${listing.floor ?? '-'} из ${listing.floorsTotal ?? '-'} эт.`
      : null,
  ].filter((fact): fact is string => Boolean(fact))

  return {
    address,
    facts,
    href,
    id: listing.id,
    image: listing.image,
    imageAlt: listing.title,
    priceLabel: formatPrice(listing.price),
    title,
  }
}

export function buildObjectBreadcrumbs(listing: PropertyListing): ObjectBreadcrumbItem[] {
  const crumbs: ObjectBreadcrumbItem[] = [{ href: '/nedvizhimost', label: 'Недвижимость' }]

  if (listing.categoryKey === 'flat' || listing.categoryKey === 'room') {
    crumbs.push({ href: '/kvartiry', label: 'Квартиры' })
    const roomCrumb = buildApartmentBreadcrumb(listing)
    if (roomCrumb) crumbs.push(roomCrumb)
  } else if (listing.categoryKey === 'house') {
    crumbs.push({ href: '/doma', label: 'Дома' })
  } else if (listing.categoryKey === 'land') {
    crumbs.push({ href: '/zemelnye-uchastki', label: 'Земельные участки' })
  } else if (listing.categoryKey === 'commercial') {
    crumbs.push({ href: '/kommercheskaya-nedvizhimost', label: 'Коммерческая недвижимость' })
  } else if (listing.categoryKey === 'construction') {
    crumbs.push({ href: '/stroitelstvo', label: 'Строительство' })
  }

  crumbs.push({ label: 'Объект' })
  return crumbs
}

export function buildObjectMobileTopBarTitle(listing: PropertyListing) {
  const action = listing.dealType === 'rent' ? 'Сдаётся' : 'Продаётся'
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : ''

  if (listing.categoryKey === 'flat' || listing.categoryKey === 'room') {
    if (listing.isStudio) return `${action} студия${area}`
    if (listing.rooms) return `${action} ${listing.rooms}-комн. квартира${area}`
    return `${action} квартира${area}`
  }
  if (listing.categoryKey === 'house') return `${action} дом${area}`
  if (listing.categoryKey === 'land') return `${action} участок${area}`
  if (listing.categoryKey === 'commercial') return `${action} коммерческий объект${area}`
  if (listing.categoryKey === 'construction') return `${action} проект строительства${area}`
  return `${action} ${listing.category.toLowerCase()}${area}`
}

export function buildObjectVisibleHeadingTitle(listing: PropertyListing) {
  const action = listing.dealType === 'rent' ? 'Сдаётся' : 'Продаётся'
  const category = buildSeoCategoryLabel(listing)
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : ''
  return `${action} ${category}${area}`
}

export function resolveVisibleHeadingAddress(
  listing: PropertyListing,
  generatedTitle: ReturnType<typeof buildObjectSeoTitle>,
  visibleHeadingTitle: string,
  shouldBlurAddress: boolean,
) {
  const fullAddress = listing.address?.trim() || null
  const compactedAddress = generatedTitle.address ?? compactAddress(listing.address)
  if (!fullAddress) return compactedAddress
  if (shouldBlurAddress) return compactedAddress

  const normalizedTitle = visibleHeadingTitle.toLowerCase()
  if (normalizedTitle.includes(fullAddress.toLowerCase())) return null
  if (compactedAddress && normalizedTitle.includes(compactedAddress.toLowerCase())) return null
  return fullAddress
}

export function buildObjectSummarySpecs(listing: PropertyListing): PropertyDetailSummaryItemDto[] {
  const items = [
    listing.area
      ? { icon: 'area', label: 'Общая площадь', value: `${formatNumber(listing.area)} м²` }
      : null,
    listing.areaLiving
      ? {
          icon: 'living-area',
          label: 'Жилая площадь',
          value: `${formatNumber(listing.areaLiving)} м²`,
        }
      : null,
    listing.areaKitchen
      ? {
          icon: 'kitchen',
          label: 'Площадь кухни',
          value: `${formatNumber(listing.areaKitchen)} м²`,
        }
      : null,
    listing.floor || listing.floorsTotal
      ? {
          icon: 'floor',
          label: 'Этаж',
          value: `${listing.floor ?? '-'} из ${listing.floorsTotal ?? '-'}`,
        }
      : null,
    { icon: 'rooms', label: 'Объект', value: buildRoomsLabel(listing) },
  ].filter(Boolean) as PropertyDetailSummaryItemDto[]
  return items.slice(0, 4)
}

export function buildObjectDetailRows(
  listing: PropertyListing,
  shouldBlurAddress: boolean,
): PropertyDetailRowDto[] {
  const addressParts = shouldBlurAddress
    ? splitBlurredAddress(listing.address)
    : { hiddenHousePart: null, visiblePrefix: listing.address }
  const visibleAddress = addressParts.visiblePrefix
    ? `${addressParts.visiblePrefix}${addressParts.hiddenHousePart ? '…' : ''}`
    : null

  return [
    listing.area ? { label: 'Общая площадь', value: `${formatNumber(listing.area)} м²` } : null,
    listing.areaLiving
      ? { label: 'Жилая площадь', value: `${formatNumber(listing.areaLiving)} м²` }
      : null,
    listing.areaKitchen
      ? { label: 'Площадь кухни', value: `${formatNumber(listing.areaKitchen)} м²` }
      : null,
    listing.rooms || listing.isStudio
      ? { label: 'Комнатность', value: buildRoomsLabel(listing) }
      : null,
    listing.floor || listing.floorsTotal
      ? { label: 'Этаж', value: `${listing.floor ?? '-'} из ${listing.floorsTotal ?? '-'}` }
      : null,
    listing.builtYear ? { label: 'Год постройки', value: String(listing.builtYear) } : null,
    listing.houseType ? { label: 'Тип дома', value: listing.houseType } : null,
    listing.buildingType ? { label: 'Материал стен', value: listing.buildingType } : null,
    listing.renovation ? { label: 'Ремонт', value: listing.renovation } : null,
    listing.district && listing.district !== listing.city
      ? { label: 'Район', value: listing.district }
      : null,
    listing.city ? { label: 'Город', value: listing.city } : null,
    visibleAddress ? { label: 'Адрес', value: visibleAddress } : null,
    listing.lotAreaSotka
      ? { label: 'Площадь участка', value: `${formatNumber(listing.lotAreaSotka)} сот.` }
      : null,
    listing.landCategory ? { label: 'Категория земли', value: listing.landCategory } : null,
    listing.landUseType ? { label: 'Разрешённое использование', value: listing.landUseType } : null,
    listing.cadastralNumber ? { label: 'Кадастровый номер', value: listing.cadastralNumber } : null,
    listing.commercialType
      ? { label: 'Тип коммерческого объекта', value: commercialValueLabel(listing.commercialType) }
      : null,
    listing.commercialBuildingType
      ? { label: 'Тип здания', value: listing.commercialBuildingType }
      : null,
    listing.entranceType ? { label: 'Тип входа', value: listing.entranceType } : null,
    listing.hasHeating !== null && listing.hasHeating !== undefined
      ? { label: 'Отопление', value: listing.hasHeating ? 'Есть' : 'Нет' }
      : null,
    listing.ceilingHeight
      ? { label: 'Высота потолков', value: `${formatNumber(listing.ceilingHeight)} м` }
      : null,
  ].filter(Boolean) as PropertyDetailRowDto[]
}

export async function getSimilarListings(listing: PropertyListing) {
  const baseQuery = {
    category: listing.categoryKey,
    city: listing.citySlug ?? tenant.cityEn,
    dealType: listing.dealType ?? 'sale',
    limit: 18,
    sort: 'newest' as const,
  }
  const roomQuery = listing.isStudio
    ? { ...baseQuery, studio: true }
    : listing.rooms
      ? { ...baseQuery, rooms: listing.rooms }
      : baseQuery
  const primaryItems = uniqueSimilarListings(await getPublicCatalogItems(roomQuery), listing.id)
  if (primaryItems.length >= 4) return primaryItems.slice(0, 4)
  const fallbackItems = await getPublicCatalogItems(baseQuery)
  return uniqueSimilarListings([...primaryItems, ...fallbackItems], listing.id).slice(0, 4)
}

export function getPricePerMeter(listing: PropertyListing) {
  if (!listing.price || !listing.area) return null
  return formatPrice(Math.round(listing.price / listing.area))
}

export function buildSuggestedOffer(listing: PropertyListing) {
  if (!listing.price) return null
  return formatPrice(Math.round(listing.price * 0.97))
}

export function buildViewingDateOptions() {
  const today = getMoscowStartOfDay()
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Moscow',
  })
  const weekdays = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    weekday: 'long',
  })
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() + index)
    return {
      dateLabel: formatter.format(date),
      label:
        index === 0 ? 'Сегодня' : index === 1 ? 'Завтра' : capitalizeFirst(weekdays.format(date)),
      value: date.toISOString().slice(0, 10),
    }
  })
}

export function buildYandexMapUrl(address: string) {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(`Краснодар, ${address}`)}`
}

export function buildBuildingDescription(listing: PropertyListing) {
  const parts = [
    listing.category,
    listing.floor || listing.floorsTotal
      ? `этаж ${listing.floor ?? '-'} из ${listing.floorsTotal ?? '-'}`
      : null,
    listing.district ? `район: ${listing.district}` : null,
  ].filter(Boolean)
  return parts.length
    ? `${capitalize(parts.join(', '))}. Перед показом специалист агентства недвижимости уточнит актуальность объекта, документы и условия сделки.`
    : 'Перед показом специалист агентства недвижимости уточнит актуальность объекта, документы и условия сделки.'
}

export function normalizeObjectDescription(
  description?: null | string,
  objectCode?: null | string,
) {
  if (!description) return null
  let cleaned = description
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/<\/p\s*>/giu, '\n\n')
    .replace(/<[^>]*>/gu, '')
    .replace(/&nbsp;/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;/giu, "'")
    .replace(/&laquo;/giu, '«')
    .replace(/&raquo;/giu, '»')
    .replace(/\r/gu, '')
    .replace(/\u00a0/gu, ' ')
    .trim()
  if (objectCode) {
    cleaned = cleaned.replace(
      new RegExp(`^\\s*Код\\s+объекта\\s*:?\\s*${escapeRegExp(objectCode)}\\.?\\s*`, 'iu'),
      '',
    )
  }
  const paragraphs = cleaned
    .split(/\n{2,}/u)
    .map((block) => normalizeDescriptionParagraph(block))
    .filter((paragraph) => !/^(?:\.{2,}|[-–—]+)$/u.test(paragraph))
    .filter(Boolean)
  return paragraphs.length ? paragraphs : null
}

export function resolvePropertyRobots(listing: null | PropertyListing) {
  if (!listing) return { follow: true, index: false }
  return resolvePropertyRobotsState({
    isPublished: listing.isPublished,
    siteIndexable: isIndexable(),
    status: listing.status,
    unpublishedAt: listing.unpublishedAt,
  })
}

export function getPropertySocialPreviewImage(listing: PropertyListing) {
  return listing.images[0] ?? listing.image ?? null
}

export async function getPublicListingBySlug(slug: string): Promise<null | PropertyListing> {
  return (await getSiteEngine()).getProperty(slug)
}

async function getPublicCatalogItems(query: CatalogQuery): Promise<PropertyListing[]> {
  const result = await (
    await getSiteEngine()
  ).getCatalog({
    category: query.category as PropertyDetailDto['categoryKey'] | undefined,
    dealType: query.dealType,
    limit: query.limit,
    page: query.page,
  })
  return result.items.map((item) => ({
    ...item,
    description: item.description ?? '',
    features: [],
  }))
}

function buildObjectMetadataBaseTitle(main: string, discriminator: null | string) {
  const brandSuffixLength = ` | ${siteConfig.clientName}`.length
  const maxBaseLength = OBJECT_METADATA_TITLE_MAX_LENGTH - brandSuffixLength
  if (!discriminator) return truncateSeoText(main, maxBaseLength)
  const separator = ' — '
  const mainMaxLength = Math.max(24, maxBaseLength - separator.length - discriminator.length)
  return `${truncateSeoText(main, mainMaxLength)}${separator}${discriminator}`
}

function buildObjectTitleDiscriminator(listing: PropertyListing, address: null | string) {
  const district =
    listing.district && listing.district !== listing.city ? compactAddress(listing.district) : null
  const value = address ?? district
  return value
    ? truncateAddressDiscriminator(value, OBJECT_METADATA_DISCRIMINATOR_MAX_LENGTH)
    : null
}

function truncateAddressDiscriminator(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized.length <= maxLength) return normalized
  for (const separator of [',', ' ']) {
    const index = normalized.lastIndexOf(separator)
    if (index <= 0) continue
    const tail = normalized.slice(index)
    const prefixLength = maxLength - tail.length - 1
    if (prefixLength >= 8) return `${normalized.slice(0, prefixLength).trimEnd()}…${tail}`
  }
  return truncateSeoText(normalized, maxLength)
}

function buildSeoAddressLabel(listing: PropertyListing, hideHouseNumber = false) {
  const compactedAddress = compactAddress(listing.address)
  if (!compactedAddress) return null
  const blurredAddress = hideHouseNumber ? splitBlurredAddress(compactedAddress) : null
  const address = blurredAddress?.applied
    ? `${(blurredAddress.visiblePrefix ?? compactedAddress).trimEnd().replace(/,\s*$/u, '')}, …`
    : compactedAddress
  const district =
    listing.district && listing.district !== listing.city ? compactAddress(listing.district) : null
  return !district || address.toLowerCase().includes(district.toLowerCase())
    ? address
    : `${address}, ${district}`
}

function compactAddress(value?: null | string) {
  if (!value) return null
  const address = value
    .replace(/\s+/gu, ' ')
    .replace(/\s*,\s*/gu, ', ')
    .replace(/^Россия,\s*/iu, '')
    .replace(/^Российская Федерация,\s*/iu, '')
    .replace(/^региона,\s*/iu, '')
    .replace(/^г\.?\s*Краснодар,\s*/iu, '')
    .replace(/^город\s+Краснодар,\s*/iu, '')
    .replace(/^Краснодар,\s*/iu, '')
    .replace(/,\s*$/u, '')
    .trim()
  return address || null
}

function buildApartmentBreadcrumb(listing: PropertyListing): null | ObjectBreadcrumbItem {
  if (listing.isStudio) return { href: '/kvartiry-studii', label: 'Квартиры-студии' }
  if (listing.rooms === 1) return { href: '/odnokomnatnye-kvartiry', label: '1-комнатные квартиры' }
  if (listing.rooms === 2) return { href: '/dvuhkomnatnye-kvartiry', label: '2-комнатные квартиры' }
  if (listing.rooms === 3) return { href: '/trehkomnatnye-kvartiry', label: '3-комнатные квартиры' }
  return null
}

function buildRoomsLabel(listing: PropertyListing) {
  if (listing.isStudio) return 'Студия'
  if (listing.rooms) return `${listing.rooms}-комн. ${listing.category}`
  return listing.category
}

function buildSeoCategoryLabel(listing: PropertyListing) {
  if (listing.categoryKey === 'flat' || listing.categoryKey === 'room') {
    if (listing.isStudio) return 'квартира-студия'
    if (listing.rooms === 1) return 'однокомнатная квартира'
    if (listing.rooms === 2) return 'двухкомнатная квартира'
    if (listing.rooms === 3) return 'трёхкомнатная квартира'
    if (listing.rooms && listing.rooms > 3) return `${listing.rooms}-комнатная квартира`
    return listing.categoryKey === 'room' ? 'комната' : 'квартира'
  }
  if (listing.categoryKey === 'house') return 'дом'
  if (listing.categoryKey === 'land') return 'земельный участок'
  if (listing.categoryKey === 'commercial') return 'коммерческий объект'
  if (listing.categoryKey === 'construction') return 'проект строительства'
  return listing.category
}

function buildObjectSummaryTitle(listing: PropertyListing) {
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : ''
  return `${capitalize(buildSeoCategoryLabel(listing))}${area}`
}

function commercialValueLabel(value: string) {
  const labels: Record<string, string> = {
    'auto repair': 'Автосервис',
    'business center': 'Бизнес-центр',
    'detached building': 'Отдельно стоящее здание',
    'free purpose': 'Свободное назначение',
    'public catering': 'Общепит',
    business: 'Готовый бизнес',
    common: 'Общий',
    free_purpose: 'Свободное назначение',
    manufacturing: 'Производство',
    office: 'Офис',
    retail: 'Торговое помещение',
    separate: 'Отдельный',
    warehouse: 'Склад',
  }
  return labels[value] ?? value
}

function uniqueSimilarListings(listings: PropertyListing[], currentId: string) {
  const seen = new Set<string>()
  return listings.filter((item) => {
    if (item.id === currentId || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function getMoscowStartOfDay() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Moscow',
    year: 'numeric',
  }).formatToParts(new Date())
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)
  return new Date(Date.UTC(year, month - 1, day))
}

function capitalizeFirst(value: string) {
  return value ? value[0].toLocaleUpperCase('ru-RU') + value.slice(1) : value
}

function normalizeDescriptionParagraph(value: string) {
  return value
    .split('\n')
    .map((line) => line.replace(/\s+/gu, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.:;!?])/gu, '$1')
    .replace(/\s{2,}/gu, ' ')
    .trim()
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}
