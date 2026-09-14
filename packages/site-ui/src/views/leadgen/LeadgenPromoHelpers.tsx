import type { LeadgenPromoContentDto } from '@starter/site-contracts'

export function renderHeroTitle(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title

  const [before, ...rest] = title.split(accent)

  return (
    <>
      {before}
      <span className="text-[var(--leadgen-promo-landing-content-disabled)]">{accent}</span>
      {rest.join(accent)}
    </>
  )
}

export function normalizeBaseSectionPoint(
  point: LeadgenPromoContentDto['baseSection']['points'][number],
) {
  return typeof point === 'string' ? { title: null, text: point } : point
}
