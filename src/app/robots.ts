import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://souz-home.ru'
  const production = process.env.APP_ENV === 'production' && base.startsWith('https://')

  return {
    rules: production
      ? [{ allow: '/', disallow: ['/admin/', '/api/'], userAgent: '*' }]
      : [{ disallow: '/', userAgent: '*' }],
    sitemap: new URL('/sitemap.xml', base).toString(),
  }
}
