import { getPayload } from 'payload'

import config from '../src/payload.config'
import { tenant, tenantConfig } from '../src/project/tenant.config'

const payload = await getPayload({ config })
const demoPrefix = `${tenant.slug}-demo`
const allowExisting = process.env.DEMO_SEED_ALLOW_EXISTING === 'true'

const existing = await payload.find({
  collection: 'properties',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  where: { slug: { like: `${demoPrefix}-` } },
})
const total = await payload.count({ collection: 'properties', overrideAccess: true })
if (existing.docs.length === 0 && total.totalDocs > 0 && !allowExisting) {
  throw new Error(
    'Refusing to seed demo records into a non-empty property catalog. Set DEMO_SEED_ALLOW_EXISTING=true after review.',
  )
}

await payload.updateGlobal({
  slug: 'site-settings',
  overrideAccess: true,
  data: {
    siteName: tenantConfig.brand,
    defaultTitle: `${tenantConfig.brand} — недвижимость в ${tenantConfig.city.prepositional}`,
    defaultDescription: `Демонстрационный каталог недвижимости ${tenantConfig.city.genitive}. Объекты помечены как демонстрационные.`,
  },
})

const agentSlug = `${demoPrefix}-expert`
let agent = (
  await payload.find({
    collection: 'agents',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: agentSlug } },
  })
).docs[0]

if (!agent) {
  agent = await payload.create({
    collection: 'agents',
    overrideAccess: true,
    data: {
      name: `Эксперт ${tenantConfig.brand}`,
      slug: agentSlug,
      origin: 'manual',
      status: 'active',
      isPublished: true,
      phone: tenantConfig.contacts.phone,
      email: tenantConfig.contacts.email,
      position: `Эксперт по недвижимости ${tenantConfig.city.genitive}`,
      bio: 'Демонстрационный профиль. Не является карточкой реального сотрудника.',
    },
  })
}

const districts = ['Центральный', 'Северный', 'Западный', 'Южный', 'Новый'] as const
const images = [
  '/images/agency-home-secondary-hero.webp',
  '/images/construction-project-default.jpg',
  '/images/agency-sell-apartment-hero.webp',
] as const
let created = 0

for (let index = 1; index <= 12; index++) {
  const slug = `${demoPrefix}-${String(index).padStart(2, '0')}`
  const found = await payload.find({
    collection: 'properties',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  if (found.docs.length > 0) continue

  const rooms = (index % 3) + 1
  const area = 38 + index * 2
  await payload.create({
    collection: 'properties',
    overrideAccess: true,
    data: {
      origin: 'manual',
      status: 'active',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      slug,
      isFeatured: index <= 4,
      market: index % 3 === 0 ? 'newbuild' : 'secondary',
      dealType: 'sale',
      category: 'apartment',
      dealStatus: 'available',
      priceMinorUnits: (5_600_000 + index * 185_000) * 100,
      currency: 'RUB',
      mortgageAvailable: true,
      totalAreaCm2: area * 10_000,
      livingAreaCm2: Math.round(area * 0.62) * 10_000,
      kitchenAreaCm2: (10 + (index % 5)) * 10_000,
      rooms,
      floor: (index % 16) + 1,
      floorsTotal: 18,
      ceilingHeightCm: 275,
      region: tenantConfig.city.nominative,
      district: districts[index % districts.length],
      localityName: tenantConfig.city.nominative,
      addressPublic: `${tenantConfig.city.nominative}, демонстрационный адрес, объект ${index}`,
      latitude: tenantConfig.map.center[0] + (index % 7) * 0.003,
      longitude: tenantConfig.map.center[1] + (index % 5) * 0.004,
      geoPrecision: 'locality',
      title: `Демонстрационная ${rooms}-комнатная квартира №${index}`,
      description: `Демонстрационный объект для показа возможностей ${tenantConfig.brand}. Не является публичной офертой или реальным объявлением.`,
      photos: [
        {
          externalUrl: images[index % images.length],
          alt: `Демонстрационный объект №${index}`,
          isMain: true,
        },
      ],
      agent: agent.id,
    },
  })
  created += 1
}

const finalCount = await payload.count({
  collection: 'properties',
  overrideAccess: true,
  where: { slug: { like: `${demoPrefix}-` } },
})
payload.logger.info({ created, total: finalCount.totalDocs }, 'Demo seed complete')
process.exit(0)
