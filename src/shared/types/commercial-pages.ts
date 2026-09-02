import type { PublicContacts, PublicOffice, PublicReview } from './public-content'

export type CommercialPageFamily = 'about' | 'career' | 'construction' | 'contacts' | 'mortgage' | 'reviews'

export type CommercialPageConfig = {
  cta: string
  ctaHref: string
  description: string
  eyebrow: string
  facts: { label: string; value: string }[]
  family: CommercialPageFamily
  familySection?: {
    eyebrow: string
    items: { text: string; title: string }[]
    title: string
  }
  heroImage: string
  key: string
  steps: { description: string; title: string }[]
  title: string
}

export type CommercialPageData = {
  contacts?: PublicContacts
  offices?: PublicOffice[]
  reviews?: PublicReview[]
}
