import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

export const PUBLIC_CACHE_TAGS = {
  agents: 'public:agents',
  catalog: 'public:catalog',
  config: 'public:config',
  content: 'public:content',
  redirects: 'public:redirects',
  sitemap: 'public:sitemap',
} as const

export type PublicCacheTag = (typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS]
export const publicCacheTagValues = Object.values(PUBLIC_CACHE_TAGS) as PublicCacheTag[]

export function invalidatePublicCache(tags: readonly PublicCacheTag[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, 'max')
}

export function collectionCacheHooks(tags: readonly PublicCacheTag[]) {
  const invalidate = (({ req }) => {
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
