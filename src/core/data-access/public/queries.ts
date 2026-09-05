import 'server-only'

import { getPayload } from 'payload'

import { createPublicGatewayContext } from '@/core/access/public-gateway'
import type { Agent, Property, ResidentialComplex } from '@/payload-types'
import config from '@/payload.config'
import type { PublicAgent, PublicComplex, PublicContacts, PublicProperty } from '@/shared/types/public-content'

export type { PublicAgent, PublicComplex, PublicContacts, PublicProperty } from '@/shared/types/public-content'

const context = () => createPublicGatewayContext()

export async function getPublicProperties(limit = 100): Promise<PublicProperty[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'properties', context: context(), depth: 1, limit: Math.min(limit, 100), overrideAccess: false, sort: '-publishedAt' })
  return result.docs.map(toPublicProperty)
}

export async function getPublicPropertyBySlug(slug: string): Promise<PublicProperty | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'properties', context: context(), depth: 1, limit: 1, overrideAccess: false, where: { slug: { equals: slug } } })
  return result.docs[0] ? toPublicProperty(result.docs[0]) : null
}

export async function getPublicComplexes(limit = 100): Promise<PublicComplex[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'residential-complexes', context: context(), depth: 1, limit: Math.min(limit, 100), overrideAccess: false, sort: 'name' })
  return result.docs.map(toPublicComplex)
}

export async function getPublicAgents(limit = 100): Promise<PublicAgent[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'agents', context: context(), depth: 1, limit: Math.min(limit, 100), overrideAccess: false, sort: 'name' })
  return result.docs.map(toPublicAgent)
}

export async function getPublicContacts(): Promise<PublicContacts> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', context: context(), overrideAccess: false })
  return { siteName: settings.siteName, defaultTitle: settings.defaultTitle ?? undefined, defaultDescription: settings.defaultDescription ?? undefined }
}

function relationId(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return undefined
}

function toPublicProperty(property: Property): PublicProperty {
  return {
    address: property.addressPublic ?? '',
    agentId: relationId(property.agent),
    category: property.category,
    description: property.description ?? '',
    district: property.district ?? undefined,
    floor: property.floor ?? undefined,
    floorsTotal: property.floorsTotal ?? undefined,
    id: property.id,
    images: (property.photos ?? []).flatMap((item) => {
      if (item.externalUrl) return [{ alt: item.alt ?? property.title, src: item.externalUrl }]
      const media = typeof item.media === 'object' ? item.media : null
      return media?.url ? [{ alt: item.alt ?? media.alt ?? property.title, src: media.url }] : []
    }),
    market: property.market,
    priceMinorUnits: property.priceMinorUnits,
    rooms: property.rooms ?? undefined,
    slug: property.slug,
    title: property.title,
    totalAreaCm2: property.totalAreaCm2,
    updatedAt: property.updatedAt,
  }
}

function toPublicComplex(complex: ResidentialComplex): PublicComplex {
  return { address: complex.address ?? undefined, description: complex.description ?? '', developer: complex.developer && typeof complex.developer === 'object' ? complex.developer.name : undefined, district: complex.district ?? undefined, id: complex.id, name: complex.name, readiness: complex.readiness ?? undefined, slug: complex.slug }
}

function toPublicAgent(agent: Agent): PublicAgent {
  return { bio: agent.bio ?? '', email: agent.email ?? undefined, id: agent.id, name: agent.name, phone: agent.phone ?? undefined, position: agent.position ?? undefined, slug: agent.slug }
}
