import type {
  FooterColumn,
  HeaderNavItem,
  LegalLink,
  MobileMenuAction,
  MobileMenuLink,
} from '@/shared/types/site-shell'

export const headerNav: HeaderNavItem[] = [
  { label: 'Главная', href: '/' },
  {
    label: 'Недвижимость', href: '/nedvizhimost-rostov', description: 'Новостройки, квартиры, дома и коммерческая недвижимость в Ростове', showOverviewLink: true,
    megaSections: [
      { title: 'Новостройки', href: '/novostroyki-rostova', links: [{ label: 'Все жилые комплексы', href: '/novostroyki-rostova' }] },
      { title: 'Квартиры', href: '/kvartiry-rostova', links: [
        { label: 'Однокомнатные квартиры', href: '/odnokomnatnye-kvartiry-rostov' },
        { label: 'Двухкомнатные квартиры', href: '/dvuhkomnatnye-kvartiry-rostov' },
        { label: 'Трёхкомнатные квартиры', href: '/trehkomnatnye-kvartiry-rostov' },
        { label: 'Квартиры-студии', href: '/kvartiry-studii-rostov' },
      ] },
      { title: 'Загородная', href: '/zagorodnaya-nedvizhimost', links: [
        { label: 'Дома', href: '/doma-rostov' },
        { label: 'Земельные участки', href: '/zemelnye-uchastki-rostov' },
        { label: 'Строительство домов', href: '/stroitelstvo-domov' },
      ] },
      { title: 'Коммерческая', href: '/kommercheskaya-nedvizhimost', links: [
        { label: 'Офисы', href: '/ofisy-rostov' },
        { label: 'Торговые помещения', href: '/torgovye-pomeshcheniya-rostov' },
        { label: 'Склады', href: '/sklady-rostov' },
      ] },
    ],
    children: [
      { label: 'Новостройки', href: '/novostroyki-rostova' },
      { label: 'Квартиры', href: '/kvartiry-rostova' },
      { label: 'Загородная', href: '/zagorodnaya-nedvizhimost' },
      { label: 'Коммерческая', href: '/kommercheskaya-nedvizhimost' },
    ],
    matchPrefixes: ['/nedvizhimost-rostov', '/novostroyki-rostova', '/kvartiry-rostova', '/property', '/doma-', '/zemelnye-', '/kommercheskaya-', '/ofisy-', '/torgovye-', '/sklady-'],
  },
  { label: 'Ипотека', href: '/ipoteka', matchPrefixes: ['/ipoteka', '/semeinaya-ipoteka-rostov'] },
  {
    label: 'Сервисы', href: '/stroitelstvo-domov', showOverviewLink: false,
    children: [
      { label: 'Строительство домов', href: '/stroitelstvo-domov', description: 'Участок, смета, подрядчик и ипотека' },
      { label: 'Ипотечный центр', href: '/ipoteka', description: 'Платёж, программа и требования банка' },
      { label: 'Семейная ипотека', href: '/semeinaya-ipoteka-rostov', description: 'Проверка условий и подбор ЖК' },
    ],
    matchPrefixes: ['/stroitelstvo-domov', '/ipoteka', '/semeinaya-ipoteka-rostov'],
  },
  {
    label: 'Компания', href: '/about', showOverviewLink: false,
    children: [
      { label: 'О нас', href: '/about', description: 'Команда и принципы работы' },
      { label: 'Сотрудники', href: '/sotrudniki', description: 'Специалисты и направления' },
      { label: 'Вакансии', href: '/rabota-rieltorom-rostov', description: 'Работа в команде' },
      { label: 'Отзывы', href: '/reviews', description: 'Проверяемая обратная связь' },
    ],
    matchPrefixes: ['/about', '/sotrudniki', '/reviews', '/rabota-rieltorom-rostov'],
  },
  { label: 'Журнал', href: '/journal' },
]

export const footerColumns: FooterColumn[] = [
  { title: 'Недвижимость', links: [
    { label: 'Квартиры', href: '/kvartiry-rostova' }, { label: 'Новостройки', href: '/novostroyki-rostova' }, { label: 'Загородная', href: '/zagorodnaya-nedvizhimost' }, { label: 'Коммерческая', href: '/kommercheskaya-nedvizhimost' },
  ] },
  { title: 'Сервисы', links: [
    { label: 'Ипотека', href: '/ipoteka' }, { label: 'Семейная ипотека', href: '/semeinaya-ipoteka-rostov' }, { label: 'Строительство домов', href: '/stroitelstvo-domov' },
  ] },
  { title: 'Компания', links: [
    { label: 'О нас', href: '/about' }, { label: 'Вакансии', href: '/rabota-rieltorom-rostov' }, { label: 'Журнал', href: '/journal' }, { label: 'Карта сайта', href: '/sitemap' },
  ] },
]

export const legalLinks: LegalLink[] = [
  { label: 'Правовая информация', href: '/legal' },
  { label: 'Личный кабинет', href: '/admin/login', nofollow: true },
  { label: 'Разработан в АМС-24', href: 'https://ams24.ru/', external: true },
]

export const mobileMenuPropertyLinks: MobileMenuLink[] = [
  { label: 'Квартиры', href: '/kvartiry-rostova' },
  { label: 'Новостройки', href: '/novostroyki-rostova' },
  { label: 'Коммерция', href: '/kommercheskaya-nedvizhimost' },
  { label: 'Загородная', href: '/zagorodnaya-nedvizhimost' },
  { label: 'Строительство', href: '/stroitelstvo-domov' },
]

export const mobileMenuServiceActions: MobileMenuAction[] = [
  { label: 'Ипотечный центр', href: '/ipoteka' },
  { label: 'Выбрать специалиста', href: '/sotrudniki' },
  { label: 'Отзывы', href: '/reviews' },
  { label: 'Наш офис', href: '/contacts' },
]
