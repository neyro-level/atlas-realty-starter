import type { HomeContent } from '@/shared/types/home'

export const homeContent: HomeContent = {
  hero: {
    eyebrow: 'Союз Застройщиков · Ростов-на-Дону',
    titleLines: ['Проверенная', 'недвижимость', 'в Ростове'],
    lead: 'Сравниваем жилые комплексы, готовые квартиры, ипотеку и строительство в одной понятной системе.',
    ctaLabel: 'Смотреть новостройки',
    ctaHref: '/novostroyki-rostova',
    fallbackImage: { alt: 'Каталог недвижимости', src: '/images/ui-home-hero.webp' },
    trustEmpty: 'Каталог ЖК',
    trustSuffix: 'готовые квартиры · ипотека',
  },
  directions: [
    {
      title: 'Новостройки',
      description: 'Районы, сроки сдачи, планировки и условия покупки.',
      href: '/novostroyki-rostova',
      icon: 'new-buildings',
    },
    {
      title: 'Готовые квартиры',
      description: 'Опубликованные объекты из единого Payload-каталога.',
      href: '/kvartiry-rostova',
      icon: 'apartments',
    },
    {
      title: 'Ипотечный центр',
      description: 'Платёж, первый взнос и требования банка до выбора.',
      href: '/ipoteka',
      icon: 'mortgage',
    },
  ],
  residentialComplexes: {
    eyebrow: 'Новостройки',
    title: 'Жилые комплексы Ростова',
    href: '/novostroyki-rostova',
    empty: 'ЖК появятся после публикации в Payload Admin.',
  },
  properties: {
    eyebrow: 'Готовое жильё',
    title: 'Квартиры и объекты',
    href: '/kvartiry-rostova',
    empty: 'Мы не показываем фиктивные квартиры: карточки появятся после публикации проверенных объектов.',
  },
  process: {
    eyebrow: 'Подход',
    title: 'Сначала проверяем сценарий, потом показываем объект',
    items: [
      'Бюджет и реальный платёж',
      'Район и ежедневный маршрут',
      'Срок сдачи и документы',
      'Условия банка и сделки',
    ],
  },
  finalCta: {
    eyebrow: 'Следующий шаг',
    title: 'Соберём короткий список под вашу задачу',
    description: 'Только опубликованные ЖК и объекты, без выдуманных предложений.',
    label: 'Обсудить подбор',
    href: '/contacts',
  },
}
