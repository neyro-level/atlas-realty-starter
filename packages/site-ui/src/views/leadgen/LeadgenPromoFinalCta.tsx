import { LeadgenPromoConfiguredFinalCta } from './LeadgenPromoConfiguredFinalCta'
import { LeadgenPromoDefaultFinalCta } from './LeadgenPromoDefaultFinalCta'
import type { LeadgenFinalQuizCtaProps } from './leadgen-promo-final-cta.shared'

export function LeadgenFinalQuizCta(props: LeadgenFinalQuizCtaProps) {
  if (props.content.hideFinalCta) {
    return null
  }

  return props.content.finalCta ? (
    <LeadgenPromoConfiguredFinalCta {...props} />
  ) : (
    <LeadgenPromoDefaultFinalCta {...props} />
  )
}
