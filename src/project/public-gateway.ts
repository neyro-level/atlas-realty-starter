import 'server-only'

import { getPayload } from 'payload'

import {
  getPublicAgentBySlug as queryPublicAgentBySlug,
  getPublicCatalog as queryPublicCatalog,
  getPublicComplexBySlug as queryPublicComplexBySlug,
  getPublicComplexes as queryPublicComplexes,
  getPublicConfig as queryPublicConfig,
  getPublicFacets as queryPublicFacets,
  getPublicPageBySlug as queryPublicPageBySlug,
  getPublicPostBySlug as queryPublicPostBySlug,
  getPublicPropertyBySlug as queryPublicPropertyBySlug,
  resolvePublicRedirect as queryPublicRedirect,
} from '@/core/data-access/public/queries'
import type { PublicCatalogQuery } from '@/core/query/public-api'
import config from '@/payload.config'

import { runtimeConfig } from './env'

const options = { siteURL: runtimeConfig.siteURL }
const payload = () => getPayload({ config })

export async function getPublicCatalog(query: PublicCatalogQuery) {
  return queryPublicCatalog(await payload(), query, options)
}

export async function getPublicPropertyBySlug(slug: string) {
  return queryPublicPropertyBySlug(await payload(), slug, options)
}

export async function getPublicComplexes(query: Pick<PublicCatalogQuery, 'district' | 'limit' | 'page' | 'q'>) {
  return queryPublicComplexes(await payload(), query, options)
}

export async function getPublicComplexBySlug(slug: string) {
  return queryPublicComplexBySlug(await payload(), slug, options)
}

export async function getPublicAgentBySlug(slug: string) {
  return queryPublicAgentBySlug(await payload(), slug, options)
}

export async function getPublicPageBySlug(slug: string) {
  return queryPublicPageBySlug(await payload(), slug, options)
}

export async function getPublicPostBySlug(slug: string) {
  return queryPublicPostBySlug(await payload(), slug, options)
}

export async function getPublicConfig() {
  return queryPublicConfig(await payload())
}

export async function getPublicFacets() {
  return queryPublicFacets(await payload())
}

export async function resolvePublicRedirect(from: string) {
  return queryPublicRedirect(await payload(), from)
}
