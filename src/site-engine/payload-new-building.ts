import 'server-only'

import type { PublicComplex } from '@/shared/types/public-content'
import { getPublicComplexBySlug, getPublicComplexes } from '@/project/public-gateway'
import type { NewBuilding, NewBuildingMediaAsset } from '@/modules/new-buildings'

export async function getPayloadNewBuilding(slug: string): Promise<NewBuilding | null> {
  const complex = await getPublicComplexBySlug(slug)
  return complex ? toNewBuilding(complex) : null
}

export async function getPayloadNewBuildings(): Promise<NewBuilding[]> {
  const result = await getPublicComplexes({ limit: 50, page: 1 })
  return result.docs.map(toNewBuilding)
}

export function toNewBuilding(complex: PublicComplex): NewBuilding {
  const date = complex.updatedAt.slice(0, 10)
  const media = complex.images.map((image): NewBuildingMediaAsset => ({
    alt: image.alt,
    checkedAt: date,
    sourceUrl: null,
    src: image.src,
  }))
  const hero = media[0] ?? null
  const positioning = complex.description || `${complex.name} — жилой комплекс в Краснодаре. Поможем уточнить доступные квартиры и условия покупки.`
  return {
    sourceId: complex.id,
    about: {
      intro: positioning,
      features: [
        { title: 'Расположение', text: complex.address ?? 'Краснодар' },
        { title: 'Застройщик', text: complex.developer ?? 'Информация доступна у специалиста' },
        { title: 'Класс жилья', text: complex.classLabel ?? 'Уточняется для выбранного корпуса' },
        { title: 'Этажность', text: complex.floorsLabel ?? 'Зависит от выбранного корпуса' },
      ],
    },
    audiences: [
      { title: 'Для жизни', text: 'Подберём квартиру под состав семьи, бюджет и ежедневные маршруты.' },
      { title: 'Для переезда', text: 'Сравним районы Краснодара и варианты рядом с нужной инфраструктурой.' },
      { title: 'Для инвестиций', text: 'Проверим ликвидность планировки и условия приобретения квартиры.' },
      { title: 'Для ипотеки', text: 'Рассчитаем доступный платёж и подготовим документы для банка.' },
    ],
    cta: {
      microtext: 'Специалист уточнит наличие квартир и ответит на вопросы по комплексу.',
      primaryLabel: 'Получить подборку квартир',
      secondaryLabel: 'Задать вопрос специалисту',
    },
    developer: { description: null, name: complex.developer ?? 'Застройщик уточняется', website: null },
    documents: [
      { href: null, statusLabel: 'По запросу', text: 'Проверим перед сделкой', title: 'Проектная декларация' },
      { href: null, statusLabel: 'По запросу', text: 'Проверим перед сделкой', title: 'Разрешение на строительство' },
      { href: null, statusLabel: 'По запросу', text: 'Проверим перед сделкой', title: 'Условия договора' },
      { href: null, statusLabel: 'По запросу', text: 'Проверим перед сделкой', title: 'Ипотечные программы' },
    ],
    facts: {
      apartmentsLabel: complex.availablePropertyCount ? `${complex.availablePropertyCount} вариантов` : null,
      areaFrom: null,
      areaTo: null,
      buildingsLabel: null,
      classLabel: complex.classLabel ?? null,
      completionLabel: complex.completionLabel ?? readinessLabel(complex.readiness),
      floorsLabel: complex.floorsLabel ?? null,
      formats: ['Квартиры разных планировок'],
      mortgageLabel: 'по условиям выбранного банка',
      priceFrom: complex.priceFromMinorUnits ? complex.priceFromMinorUnits / 100 : null,
    },
    faq: [
      { answer: 'Специалист проверит доступные варианты перед консультацией.', question: 'Какие квартиры сейчас доступны?' },
      { answer: 'Цена зависит от корпуса, площади, этажа и способа оплаты.', question: 'От чего зависит стоимость квартиры?' },
      { answer: 'Да, поможем сравнить предложения банков и подготовить заявку.', question: 'Можно ли оформить ипотеку?' },
      { answer: 'Организуем просмотр после подтверждения удобного времени.', question: 'Как записаться на просмотр?' },
      { answer: 'Перед сделкой проверим документы застройщика и выбранной квартиры.', question: 'Вы проверяете документы?' },
      { answer: 'Оставьте заявку, и специалист подготовит подходящие варианты.', question: 'Как получить подборку планировок?' },
    ],
    infrastructure: {
      intro: `Покажем расположение ${complex.name} и поможем оценить ежедневные маршруты.`,
      items: [{ text: complex.address ?? 'Краснодар', timeLabel: null, title: 'Адрес комплекса' }],
    },
    layouts: [{ areaFrom: null, areaTo: null, id: 'available-layouts', image: media[1] ?? hero, label: 'Доступные планировки', priceFrom: complex.priceFromMinorUnits ? complex.priceFromMinorUnits / 100 : null }],
    location: {
      address: complex.address ?? null,
      city: 'Краснодар',
      district: complex.district ?? null,
      latitude: complex.latitude ?? null,
      longitude: complex.longitude ?? null,
    },
    media: { gallery: media.slice(1), hero, videoUrl: null },
    name: complex.name,
    positioning,
    purchaseOptions: [
      { text: 'Проверим доступность выбранной квартиры и подготовим сделку.', title: 'Полная оплата', value: null },
      { text: 'Сравним программы банков и рассчитаем ежемесячный платёж.', title: 'Ипотека', value: null },
      { text: 'Уточним действующие условия и график платежей у застройщика.', title: 'Рассрочка', value: null },
    ],
    purchaseProcess: [
      { text: 'Фиксируем бюджет, сроки и требования к квартире.', title: 'Заявка' },
      { text: 'Сравниваем доступные планировки и корпуса.', title: 'Подбор' },
      { text: 'Организуем встречу и просмотр комплекса.', title: 'Просмотр' },
      { text: 'Проверяем документы и условия договора.', title: 'Проверка' },
      { text: 'Сопровождаем подписание и расчёты.', title: 'Сделка' },
    ],
    relatedSlugs: [],
    seo: {
      canonical: `/${complex.slug}`,
      description: complex.seo.description ?? positioning.slice(0, 200),
      h1: complex.name,
      title: complex.seo.title,
    },
    shortName: complex.name.replace(/^(?:ЖК|жилой район|микрорайон|клубный квартал)\s*/iu, '').replace(/[«»]/gu, ''),
    slug: complex.slug,
    sources: [{ checkedAt: date, label: 'Внутренняя карточка объекта', url: null }],
    status: 'published',
    updatedAt: date,
    verification: { factsVerifiedAt: null, priceVerifiedAt: null },
    whyAgency: [
      { text: 'Сравниваем варианты по важным для вас параметрам.', title: 'Подбор без перегруза' },
      { text: 'Проверяем документы и существенные условия договора.', title: 'Проверка документов' },
      { text: 'Помогаем с ипотекой и организацией безопасных расчётов.', title: 'Финансовое сопровождение' },
      { text: 'Остаёмся на связи до завершения сделки.', title: 'Один специалист' },
    ],
  }
}

function readinessLabel(value: PublicComplex['readiness']) {
  if (value === 'commissioned') return 'Дом сдан'
  if (value === 'construction') return 'Строится'
  if (value === 'planned') return 'Проектируется'
  return null
}
