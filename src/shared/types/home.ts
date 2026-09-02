import type { PublicComplex, PublicProperty } from './public-content'

export type HomeDirectionIcon = 'apartments' | 'mortgage' | 'new-buildings'

export type HomeContent = {
  directions: Array<{
    description: string
    href: string
    icon: HomeDirectionIcon
    title: string
  }>
  finalCta: {
    description: string
    eyebrow: string
    href: string
    label: string
    title: string
  }
  hero: {
    ctaHref: string
    ctaLabel: string
    eyebrow: string
    fallbackImage: { alt: string; src: string }
    lead: string
    titleLines: [string, string, string]
    trustEmpty: string
    trustSuffix: string
  }
  process: {
    eyebrow: string
    items: string[]
    title: string
  }
  properties: {
    empty: string
    eyebrow: string
    href: string
    title: string
  }
  residentialComplexes: {
    empty: string
    eyebrow: string
    href: string
    title: string
  }
}

export type HomePageData = {
  complexes: PublicComplex[]
  properties: PublicProperty[]
}
