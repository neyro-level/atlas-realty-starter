import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'

import { adminWrite, ownerOnly, publicOrAdmin } from '@/payload/access/standard'
import { runtimeConfig } from '@/project/env'
import { collectionCacheHooks } from '@/core/cache/public-cache'

const publicCollections = ['properties', 'residential-complexes', 'agents', 'pages', 'posts'] as const

function documentTitle(doc: Record<string, unknown>) {
  const value = doc.title ?? doc.name
  return typeof value === 'string' ? value : 'AMS Realty Platform'
}

function documentDescription(doc: Record<string, unknown>) {
  const value = doc.description ?? doc.excerpt
  return typeof value === 'string' ? value.slice(0, 160) : ''
}

function publicPath(collectionSlug: string | undefined, doc: Record<string, unknown>) {
  const slug = typeof doc.slug === 'string' ? doc.slug : ''
  const prefix: Record<string, string> = {
    agents: 'agents',
    pages: 'pages',
    posts: 'posts',
    properties: 'properties',
    'residential-complexes': 'complexes',
  }
  return `${runtimeConfig.siteURL}/${prefix[collectionSlug ?? ''] ?? collectionSlug}/${slug}`
}

export const publicSEOPlugin = seoPlugin({
  collections: [...publicCollections],
  fields: ({ defaultFields }) => [
    ...defaultFields,
    { name: 'canonical', type: 'text' },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
  generateDescription: ({ doc }) => documentDescription(doc as Record<string, unknown>),
  generateTitle: ({ doc }) => documentTitle(doc as Record<string, unknown>),
  generateURL: ({ collectionConfig, doc }) => publicPath(collectionConfig?.slug, doc as Record<string, unknown>),
  uploadsCollection: 'media',
})

export const publicRedirectsPlugin = redirectsPlugin({
  collections: [...publicCollections],
  redirectTypes: ['301', '302', '307', '308'],
  overrides: {
    access: { create: adminWrite, delete: ownerOnly, read: publicOrAdmin({ isEnabled: { equals: true } }), update: adminWrite },
    admin: { defaultColumns: ['from', 'to.type', 'type', 'isEnabled'], group: 'Контент', useAsTitle: 'from' },
    fields: ({ defaultFields }) => [
      ...defaultFields,
      { name: 'isEnabled', type: 'checkbox', defaultValue: true, index: true },
    ],
    labels: { plural: 'Перенаправления', singular: 'Перенаправление' },
    hooks: collectionCacheHooks(['public:redirects']),
  },
})
