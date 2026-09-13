import { z } from 'zod'

import type { SiteProfile } from '@starter/site-contracts'

import { clientEnv } from './public-env'
import { siteExpert } from './site-expert'

const tenantSchema = z.object({
  slug: z.string().min(1),
  brand: z.string().min(1),
  appName: z.string().min(1),
  cityRu: z.string().min(1),
  cityRuGenitive: z.string().min(1),
  cityRuLocative: z.string().min(1),
  cityEn: z.string().min(1),
  siteDomain: z.string().min(1),
  feedSlug: z.string().min(1),
  feedTitle: z.string().min(1),
  cityScope: z.array(z.string().min(1)).min(1),
  cityScopeLocalities: z.array(z.string().min(1)).default([]),
  leadChannels: z.array(z.string().min(1)).min(1),
})

// BEGIN TENANT_VALUES
const tenantValues = {
  slug: 'atlas',
  brand: 'АТЛАС',
  projectName: 'АТЛАС — агентство недвижимости в Краснодаре',
  tagline: 'Навигация в мире недвижимости',
  city: {
    nominative: 'Краснодар',
    genitive: 'Краснодара',
    prepositional: 'Краснодаре',
    slug: 'krasnodar',
  },
  productionDomain: 'https://atlas.ams24.ru',
  contacts: {
    phone: '+7 (918) 320-99-96',
    email: 'integrator-p@yandex.ru',
    address: 'г. Краснодар, ул. Игнатова, 4/3, офис 10',
    legalOperatorAddress: 'г. Краснодар, улица им. Игнатова, дом 4/3, корп. 2',
    hours: 'Ежедневно, 9:00–20:00 (МСК)',
  },
  legal: {
    name: 'ИП Скрицкая Юлия Викторовна',
    inn: '231295699557',
    registrationNumber: '323237500365055',
  },
  map: {
    center: [45.03547, 38.975313] as const,
    zoom: 12,
    catalogZoom: 12,
  },
  leadChannels: ['ams-leads'],
  leadDelivery: {
    'ams-leads': { baseBackoffMs: 30_000, maxAttempts: 5, maxBackoffMs: 30 * 60_000, timeoutMs: 8_000 },
  },
} as const
// END TENANT_VALUES

export const tenant = tenantSchema.parse({
  slug: tenantValues.slug,
  brand: tenantValues.brand,
  appName: tenantValues.projectName,
  cityRu: tenantValues.city.nominative,
  cityRuGenitive: tenantValues.city.genitive,
  cityRuLocative: tenantValues.city.prepositional,
  cityEn: tenantValues.city.slug,
  siteDomain: new URL(clientEnv.siteUrl || tenantValues.productionDomain).host,
  feedSlug: `${tenantValues.slug}-primary-yrl`,
  feedTitle: 'Основной XML-фид',
  cityScope: [tenantValues.city.slug],
  cityScopeLocalities: [],
  leadChannels: tenantValues.leadChannels,
})

export const tenantConfig = {
  brand: tenantValues.brand,
  legalName: tenantValues.legal.name,
  projectName: tenantValues.projectName,
  tagline: tenantValues.tagline,
  city: tenantValues.city,
  domain: clientEnv.siteUrl || tenantValues.productionDomain,
  indexable: clientEnv.indexable,
  expert: siteExpert,
  contacts: {
    phone: tenantValues.contacts.phone,
    email: tenantValues.contacts.email,
    address: tenantValues.contacts.address,
    hours: tenantValues.contacts.hours,
  },
  social: { telegram: null, max: null, vk: null },
  legal: tenantValues.legal,
  logo: {
    mark: '/images/brand/atlas-mark.svg',
    wordmark: null,
    favicon: '/favicon.ico',
    socialPreview: '/images/brand/atlas-social-preview.jpg',
  },
  media: { catalogMortgageService: '/images/catalog-mortgage-service.webp' },
  seo: {
    title: `Недвижимость в ${tenantValues.city.prepositional} | ${tenantValues.brand}`,
    description: `${tenantValues.brand}: квартиры, дома, новостройки, участки, коммерческая недвижимость и сопровождение сделки.`,
  },
  theme: {
    preset: 'atlas-burgundy',
    primary: 'var(--accent)',
    primaryHover: 'var(--accent-hover)',
  },
  map: { provider: 'yandex', ...tenantValues.map },
  features: { catalogMap: true, mediaGallery: true, requests: true },
} as const satisfies SiteProfile

export const legalOperatorAddress = tenantValues.contacts.legalOperatorAddress
export const productionDomain = tenantValues.productionDomain
export const tenantLeadChannels = tenantValues.leadChannels
export const tenantLeadDelivery = tenantValues.leadDelivery
export const siteIdentity = tenantConfig
export const siteProfile = tenantConfig
