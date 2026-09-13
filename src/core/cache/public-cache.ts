import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

export const PUBLIC_CACHE_TAGS = {
  agents: 'public:agents',
  catalogFacets: 'public:catalog:facets',
  catalogList: 'public:catalog:list',
  config: 'public:config',
  content: 'public:content',
  propertyDetails: 'public:catalog:property',
  redirects: 'public:redirects',
  sitemap: 'public:sitemap',
} as const

export type PublicCacheTag = (typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS] | `public:catalog:property:${string}`
export const publicCacheTagValues = Object.values(PUBLIC_CACHE_TAGS) as PublicCacheTag[]

export function propertyCacheTag(slug: string): PublicCacheTag {
  return `public:catalog:property:${slug}`
}

export function isPublicCacheTag(value: string): value is PublicCacheTag {
  return publicCacheTagValues.includes(value as PublicCacheTag) || /^public:catalog:property:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function invalidatePublicCache(tags: readonly PublicCacheTag[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, 'max')
}

export function collectionCacheHooks(tags: readonly PublicCacheTag[]) {
  const invalidate = (({ req }) => {
    if (req.context?.ingest === true) return
    try {
      invalidatePublicCache(tags)
    } catch {
      req.payload.logger.debug({ tags }, 'public cache invalidation was deferred')
    }
  }) as CollectionAfterChangeHook & CollectionAfterDeleteHook
  return { afterChange: [invalidate], afterDelete: [invalidate] }
}

export function globalCacheHook(tags: readonly PublicCacheTag[]): GlobalAfterChangeHook {
  return ({ req }) => {
    try {
      invalidatePublicCache(tags)
    } catch {
      req.payload.logger.debug({ tags }, 'public cache invalidation was deferred')
    }
  }
}
