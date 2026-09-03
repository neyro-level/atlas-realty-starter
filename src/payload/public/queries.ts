import { getPayload } from 'payload'

import {
  buildComplexWhere,
  buildPropertyWhere,
  catalogSortValue,
  complexSortValue,
} from '@/payload/public/catalog-query'
import type { CatalogFilters, CatalogPreset } from '@/shared/types/catalog'
import config from '@/payload.config'
import { publicContactFallback } from '@/project/site-config'
import { runtimeConfig } from '@/project/env'
import { isAllowedExternalImageURL, toSafeVideoEmbedURL } from '@/shared/security/media-url'
import type { Employee, Media, Office, Property, ResidentialComplex, Review, SiteSetting } from '@/payload-types'
import type {
  PublicComplex,
  PublicContacts,
  PublicEmployee,
  PublicOffice,
  PublicProperty,
  PublicReview,
} from '@/shared/types/public-content'

export type {
  PublicComplex,
  PublicContacts,
  PublicEmployee,
  PublicOffice,
  PublicProperty,
  PublicReview,
} from '@/shared/types/public-content'

export async function getPublicComplexes(options: { featured?: boolean; limit?: number } = {}) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'residential-complexes',
    depth: 1,
    limit: options.limit ?? 100,
    overrideAccess: false,
    sort: 'sortOrder',
    where: options.featured ? { isFeatured: { equals: true } } : undefined,
  })
  return result.docs.map(toPublicComplex)
}

export async function getPublicComplexCatalog(filters: CatalogFilters, limit = 12) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'residential-complexes',
    depth: 1,
    limit,
    overrideAccess: false,
    page: filters.page,
    sort: complexSortValue(filters.sort),
    where: buildComplexWhere(filters),
  })
  return {
    docs: result.docs.map(toPublicComplex),
    page: result.page ?? filters.page,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  }
}

export async function getPublicComplexBySlug(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'residential-complexes',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ? toPublicComplex(result.docs[0]) : null
}

export async function getPublicProperties(options: { limit?: number } = {}) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: options.limit ?? 100,
    overrideAccess: false,
    sort: '-updatedAt',
  })
  return result.docs.map(toPublicProperty)
}

export async function getPublicPropertyCatalog(filters: CatalogFilters, preset: CatalogPreset, limit = 12) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'properties',
    depth: 1,
    limit,
    overrideAccess: false,
    page: filters.page,
    sort: catalogSortValue(filters.sort),
    where: buildPropertyWhere(filters, preset),
  })
  return {
    docs: result.docs.map(toPublicProperty),
    page: result.page ?? filters.page,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  }
}

export async function getPublicPropertyBySlug(slug: string) {
  const payload = await getPayload({ config })
  const numericID = /^\d+$/.test(slug) ? Number(slug) : null
  const result = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: numericID ? { id: { equals: numericID } } : { publicSlug: { equals: slug } },
  })
  return result.docs[0] ? toPublicProperty(result.docs[0]) : null
}

export async function getPublicContacts(): Promise<PublicContacts> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
  return toPublicContacts(settings)
}

export async function getPublicEmployees() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'employees',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: 'sortOrder',
    where: { and: [{ status: { equals: 'active' } }, { isPublic: { equals: true } }] },
  })
  return result.docs.map(toPublicEmployee)
}

export async function getPublicEmployeeById(id: string) {
  const employees = await getPublicEmployees()
  return employees.find((employee) => employee.id === id) ?? null
}

export async function getPublicReviews() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'reviews',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-reviewDate',
    where: { status: { equals: 'published' } },
  })
  return result.docs.map(toPublicReview)
}

export async function getPublicOffices() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'offices',
    depth: 1,
    limit: 20,
    overrideAccess: false,
    sort: 'sortOrder',
    where: { isPublished: { equals: true } },
  })
  return result.docs.map(toPublicOffice)
}

function toPublicComplex(complex: ResidentialComplex): PublicComplex {
  const gallery = [
    resolveMedia(complex.cover, complex.externalCoverUrl, `${complex.title}, обложка`),
    ...(complex.gallery ?? []).map((item, index) =>
      resolveMedia(item.image, item.externalUrl, item.alt || `${complex.title}, изображение ${index + 1}`),
    ),
  ].filter((item): item is { alt: string; src: string } => Boolean(item))
  const uniqueGallery = Array.from(new Map(gallery.map((item) => [item.src, item])).values())
  const areaLabel = complex.areaMin
    ? `${complex.areaMin.toLocaleString('ru-RU')}–${(complex.areaMax ?? complex.areaMin).toLocaleString('ru-RU')} м²`
    : 'Площадь уточняется'

  return {
    address: complex.address ?? publicContactFallback.cityName,
    advantages: (complex.advantages ?? []).map((item) => ({ description: item.description ?? '', title: item.title })),
    areaLabel,
    completionLabel: complex.completionLabel ?? 'Срок уточняется',
    description: complex.description ?? complex.shortDescription ?? '',
    developer: complex.developer ?? 'Застройщик уточняется',
    district: complex.district ?? publicContactFallback.cityName,
    gallery: uniqueGallery,
    id: complex.id,
    isFeatured: Boolean(complex.isFeatured),
    latitude: complex.location?.latitude ?? undefined,
    longitude: complex.location?.longitude ?? undefined,
    priceFrom: complex.priceFrom ?? undefined,
    purchaseTerms: (complex.purchaseTerms ?? []).map((item) => ({ title: item.title, value: item.value })),
    roomTypes: complex.roomTypes ?? [],
    seoDescription: complex.seo?.description ?? complex.shortDescription ?? `${complex.title} в Ростове-на-Дону: цены, сроки и планировки.`,
    seoTitle: complex.seo?.title ?? `${complex.title} в Ростове-на-Дону`,
    shortDescription: complex.shortDescription ?? '',
    slug: complex.slug,
    videoUrl: toSafeVideoEmbedURL(complex.videoUrl) ?? undefined,
    title: complex.title,
  }
}

function toPublicProperty(property: Property): PublicProperty {
  return {
    address: property.addressLine ?? [property.city, property.district].filter(Boolean).join(', '),
    agentId:
      property.responsibleEmployee && typeof property.responsibleEmployee === 'object'
        ? String(property.responsibleEmployee.id)
        : property.responsibleEmployee
          ? String(property.responsibleEmployee)
          : undefined,
    buildYear: property.buildYear ?? undefined,
    buildingMaterial: property.buildingMaterial ?? undefined,
    category: property.category,
    commercialType: property.commercialType ?? undefined,
    dealType: property.dealType ?? undefined,
    description: property.description ?? '',
    district: property.district ?? undefined,
    floor: property.floor ?? undefined,
    floorsTotal: property.floorsTotal ?? undefined,
    id: property.id,
    images: (property.gallery ?? [])
      .map((item, index) => {
        const media = typeof item.file === 'object' ? item.file : null
        return media?.url
          ? { alt: media.alt || `${property.title}, изображение ${index + 1}`, kind: item.kind, src: media.url }
          : null
      })
      .filter((item): item is { alt: string; kind: 'floor_plan' | 'photo'; src: string } => Boolean(item)),
    isExclusive: Boolean(property.isExclusive),
    objectCode: property.objectCode ?? undefined,
    origin: property.origin,
    isStudio: Boolean(property.isStudio),
    kitchenArea: property.kitchenArea ?? undefined,
    latitude: property.coordinates?.latitude ?? undefined,
    livingArea: property.livingArea ?? undefined,
    longitude: property.coordinates?.longitude ?? undefined,
    price: property.price ?? undefined,
    pricePerSquareMeter: property.pricePerSquareMeter ?? undefined,
    repair: property.repair ?? undefined,
    rooms: property.rooms ?? undefined,
    slug: property.publicSlug || String(property.id),
    title: property.title,
    totalArea: property.totalArea ?? undefined,
    updatedAt: property.updatedAt,
    videoUrl: toSafeVideoEmbedURL(property.videoUrl) ?? undefined,
  }
}

function toPublicEmployee(employee: Employee): PublicEmployee {
  const photo = typeof employee.photo === 'object' && employee.photo?.url
    ? { alt: employee.photo.alt || employee.publicName || employee.fullName, src: employee.photo.url }
    : undefined
  return {
    bio: employee.publicBio ?? '',
    email: employee.email ?? undefined,
    id: employee.id,
    name: employee.publicName || employee.fullName,
    phone: employee.phone ?? undefined,
    photo,
    position: employee.position ?? 'Специалист по недвижимости',
    teamSection: employee.teamSection,
  }
}

function toPublicReview(review: Review): PublicReview {
  return {
    author: review.publicName || review.authorName,
    date: review.reviewDate,
    employee: typeof review.employee === 'object' ? review.employee.publicName || review.employee.fullName : undefined,
    id: review.id,
    rating: review.rating,
    text: review.publishedText || review.text,
  }
}

function toPublicOffice(office: Office): PublicOffice {
  const photo = typeof office.photo === 'object' && office.photo?.url
    ? { alt: office.photo.alt || office.title, src: office.photo.url }
    : undefined
  return { address: office.address, id: office.id, photo, title: office.title }
}

function resolveMedia(mediaValue: Media | string | null | undefined, externalUrl: string | null | undefined, alt: string) {
  if (typeof mediaValue === 'object' && mediaValue?.url) return { alt: mediaValue.alt || alt, src: mediaValue.url }
  return externalUrl && isAllowedExternalImageURL(externalUrl, runtimeConfig.externalImageHosts)
    ? { alt, src: externalUrl }
    : null
}

function toPublicContacts(settings: SiteSetting): PublicContacts {
  const phone = settings.phone ?? publicContactFallback.phone
  const email = settings.email ?? publicContactFallback.email
  const address = settings.address ?? publicContactFallback.address
  const workingHours = settings.workingHours ?? publicContactFallback.workingHours
  return {
    address,
    callbackHref: publicContactFallback.callbackHref,
    callbackLabel: publicContactFallback.callbackLabel,
    email,
    emailHref: `mailto:${email}`,
    employeePhone: null,
    hidePropertyHouseNumbers: false,
    hours: workingHours,
    max: undefined,
    officeAddress: address,
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, '')}`,
    secondaryPhone: null,
    telegram: settings.telegramUrl ?? undefined,
    telegramUrl: settings.telegramUrl ?? undefined,
    useSharedEmployeePhone: false,
    vk: settings.vkUrl ?? undefined,
    vkUrl: settings.vkUrl ?? undefined,
    workingHours,
  }
}
