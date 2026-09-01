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

export function getPropertyPath(slug: string) {
  return `/kvartiry-rostova/${slug}`
}
