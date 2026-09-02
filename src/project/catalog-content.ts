import type { CatalogPageContent } from '@/shared/types/catalog'

export const catalogPageContent: CatalogPageContent = {
  eyebrow: 'Каталог недвижимости',
  breadcrumbs: {
    homeHref: '/',
    homeLabel: 'Главная',
    allRealtyHref: '/nedvizhimost-rostov',
    allRealtyLabel: 'Недвижимость',
  },
  tabs: [
    { href: '/nedvizhimost-rostov', label: 'Вся недвижимость' },
    { href: '/novostroyki-rostova', label: 'Новостройки' },
    { href: '/kvartiry-rostova', label: 'Квартиры' },
    { href: '/zagorodnaya-nedvizhimost', label: 'Загородная' },
    { href: '/kommercheskaya-nedvizhimost', label: 'Коммерческая' },
  ],
  empty: {
    complexTitle: 'Жилые комплексы готовятся к публикации',
    propertyTitle: 'По выбранным фильтрам объектов нет',
    description: 'Измените параметры фильтра или оставьте заявку на индивидуальный подбор. Мы не показываем вымышленные предложения.',
    selectionHref: '/contacts',
    selectionLabel: 'Обсудить подбор',
  },
}
