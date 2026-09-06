import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })
const allowExisting = process.env.ATLAS_BOOTSTRAP_ALLOW_EXISTING === 'true'

const existing = await payload.find({
  collection: 'properties', depth: 0, limit: 1, overrideAccess: true, pagination: false,
  where: { slug: { like: 'atlas-demo-' } },
})
const total = await payload.count({ collection: 'properties', overrideAccess: true })
if (existing.docs.length === 0 && total.totalDocs > 0 && !allowExisting) {
  throw new Error('Refusing to bootstrap Atlas into a non-empty property catalog. Set ATLAS_BOOTSTRAP_ALLOW_EXISTING=true after review.')
}

await payload.updateGlobal({
  slug: 'site-settings', overrideAccess: true,
  data: {
    siteName: 'АТЛАС',
    defaultTitle: 'АТЛАС — недвижимость в Краснодаре',
    defaultDescription: 'Демонстрационный каталог недвижимости Краснодара. Объекты помечены как демонстрационные.',
  },
})

let agent = (await payload.find({
  collection: 'agents', depth: 0, limit: 1, overrideAccess: true, pagination: false,
  where: { slug: { equals: 'atlas-demo-expert' } },
})).docs[0]
if (!agent) {
  agent = await payload.create({
    collection: 'agents', overrideAccess: true,
    data: {
      name: 'Эксперт АТЛАС', slug: 'atlas-demo-expert', origin: 'manual', status: 'active', isPublished: true,
      phone: '+7 (918) 320-99-96', email: 'integrator-p@yandex.ru', position: 'Эксперт по недвижимости Краснодара',
      bio: 'Демонстрационный профиль. Не является карточкой реального сотрудника.',
    },
  })
}

const districts = ['Центральный', 'Фестивальный', 'Юбилейный', 'Панорама', 'Черёмушки'] as const
const images = ['/images/agency-home-secondary-hero.webp', '/images/construction-project-default.jpg', '/images/agency-sell-apartment-hero.webp'] as const
let created = 0
for (let index = 1; index <= 30; index++) {
  const slug = `atlas-demo-${String(index).padStart(2, '0')}`
  const found = await payload.find({ collection: 'properties', depth: 0, limit: 1, overrideAccess: true, pagination: false, where: { slug: { equals: slug } } })
  if (found.docs.length > 0) continue
  const rooms = (index % 3) + 1
  const area = 38 + index * 2
  await payload.create({
    collection: 'properties', overrideAccess: true,
    data: {
      origin: 'manual', status: 'active', isPublished: true, publishedAt: new Date().toISOString(), slug,
      isFeatured: index <= 6, market: index % 3 === 0 ? 'newbuild' : 'secondary', dealType: 'sale', category: 'apartment', dealStatus: 'available',
      priceMinorUnits: (5_600_000 + index * 185_000) * 100, currency: 'RUB', mortgageAvailable: true,
      totalAreaCm2: area * 10_000, livingAreaCm2: Math.round(area * 0.62) * 10_000, kitchenAreaCm2: (10 + index % 5) * 10_000,
      rooms, floor: (index % 16) + 1, floorsTotal: 18, ceilingHeightCm: 275,
      region: 'Краснодарский край', district: districts[index % districts.length], localityName: 'Краснодар',
      addressPublic: `г. Краснодар, демонстрационный адрес, объект ${index}`,
      latitude: 45.035 + (index % 7) * 0.003, longitude: 38.975 + (index % 5) * 0.004, geoPrecision: 'locality',
      title: `Демонстрационная ${rooms}-комнатная квартира №${index}`,
      description: 'Демонстрационный объект для показа возможностей платформы АТЛАС. Не является публичной офертой или реальным объявлением.',
      photos: [{ externalUrl: images[index % images.length], alt: `Демонстрационный объект АТЛАС №${index}`, isMain: true }],
      agent: agent.id,
    },
  })
  created += 1
}

const finalCount = await payload.count({ collection: 'properties', overrideAccess: true, where: { slug: { like: 'atlas-demo-' } } })
payload.logger.info({ created, total: finalCount.totalDocs }, 'Atlas demo bootstrap complete')
process.exit(0)
