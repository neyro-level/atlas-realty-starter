import type { CollectionBeforeValidateHook } from 'payload'

import { slugify } from '../util/slugify'

export const formatPageSlug: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const sourceValue =
    typeof data?.slug === 'string' && data.slug.length > 0
      ? data.slug
      : typeof data?.title === 'string' && data.title.length > 0
        ? data.title
        : originalDoc?.slug

  if (!sourceValue) {
    return data
  }

  return {
    ...data,
    slug: slugify(sourceValue),
  }
}
