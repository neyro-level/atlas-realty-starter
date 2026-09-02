import { publicSite } from './public-site'

export const siteConfig = {
  clientName: publicSite.name,
  clientFullName: publicSite.fullName,
  defaultDescription: publicSite.defaultDescription,
  defaultTitle: publicSite.fullName,
  logo: '/images/ui-brand-mark.svg',
  tagline: 'Недвижимость в Ростове-на-Дону',
  copyright: `© ${new Date().getFullYear()} ${publicSite.fullName}`,
  registry: '',
  disclaimer: 'Информация не является публичной офертой.',
}

export const citySwitcherConfig = {
  currentSlug: 'rostov',
  cities: [
    { current: true, domainLabel: 'souz-home.ru', href: '/', label: 'Ростов-на-Дону', slug: 'rostov' },
  ],
}

export const publicContactFallback = {
  address: 'Ростов-на-Дону',
  cityName: publicSite.city,
  callbackHref: '/contacts',
  callbackLabel: 'Подобрать объект',
  email: 'info@souz-home.ru',
  phone: '+7 (863) 000-00-00',
  workingHours: 'Ежедневно, 09:00–20:00',
} as const

export function getPropertyPath(slug: string) {
  return `/kvartiry-rostova/${slug}`
}
