import type { LeadgenPromoContentDto } from '@starter/site-contracts'
import type { ElementType } from 'react'
import type { SiteImageRenderer } from '../../lib/adapters'

export type LeadgenFinalQuizCtaProps = {
  content: LeadgenPromoContentDto
  city: { nominative: string; prepositional: string }
  imageRenderer: SiteImageRenderer
  requestButton: ElementType
}

export const leadgenPrimaryButtonClass =
  'inline-flex min-h-14 w-full items-center justify-center rounded-tight bg-[var(--accent)] px-7 text-center text-body font-semibold text-white shadow-[var(--leadgen-promo-landing-shadow-primary)] transition hover:bg-[var(--accent-hover)] sm:w-auto'
