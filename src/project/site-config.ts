export const siteConfig = {
  clientName: 'AMS Realty',
  clientFullName: 'AMS Realty Platform Starter',
  defaultDescription: 'Headless starter for a real-estate platform runtime.',
  defaultTitle: 'AMS Realty Platform Starter',
  logo: '',
  tagline: 'Headless real-estate platform starter',
  copyright: `© ${new Date().getFullYear()} AMS Realty Platform Starter`,
  registry: '',
  disclaimer: 'Публичный интерфейс будет подключён отдельно.',
}

export const citySwitcherConfig = {
  currentSlug: 'starter',
  cities: [
    { current: true, domainLabel: 'starter.local', href: '/', label: 'Starter', slug: 'starter' },
  ],
}

export const publicContactFallback = {
  address: 'Тестовый адрес стартового шаблона',
  cityName: 'Starter',
  callbackHref: '/admin',
  callbackLabel: 'Открыть админку',
  email: 'info@example.com',
  phone: '+7 (900) 000-00-00',
  workingHours: 'Пн-Пт 09:00–18:00',
} as const

export function getPropertyPath(slug: string) {
  return `/properties/${slug}`
}
