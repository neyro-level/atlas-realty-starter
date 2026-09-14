import { BadgePercent, Banknote, ClipboardList, Home, Landmark, ShieldCheck } from 'lucide-react'
import type { LeadgenPromoContentDto } from '@starter/site-contracts'

export function CompactBenefitsSection({ content }: { content: LeadgenPromoContentDto }) {
  return (
    <section className="relative z-20 mx-auto w-full max-w-305 px-5 py-12 sm:px-8 sm:py-16 lg:-mt-20 lg:pb-20 lg:pt-0">
      <div className="overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-inverse)] bg-[var(--surface-card)] shadow-[var(--leadgen-promo-landing-shadow-emphasis)]">
        <div className="grid bg-[var(--leadgen-promo-landing-surface-muted)] px-6 py-7 sm:px-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-9">
          <div className="border-b border-[var(--leadgen-promo-landing-border-hover)] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <p className="text-caption font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Результат опроса
            </p>
            <h2 className="mt-3 text-section-title font-semibold leading-section-title text-[var(--text-primary)]">
              {content.afterRequestTitle}
            </h2>
          </div>
          <div className="grid lg:grid-cols-3">
            {content.trustItems.map((item, index) => (
              <article
                key={item.title}
                className="border-b border-[var(--leadgen-promo-landing-border-hover)] py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:px-7 lg:py-0 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-sm bg-[var(--surface-card)] text-[var(--accent)] shadow-[var(--leadgen-promo-landing-shadow-contrast)]">
                    {renderTrustIcon(item.icon, index)}
                  </span>
                  <span className="text-caption font-bold tracking-[0.16em] text-[var(--leadgen-promo-landing-content-active)]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-body-emphasis font-semibold leading-tight text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-support font-medium leading-6 text-[var(--leadgen-promo-landing-content-selected)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="h-0.75 bg-[var(--accent)]" aria-hidden />
      </div>
    </section>
  )
}

export function renderTrustIcon(
  icon: LeadgenPromoContentDto['trustItems'][number]['icon'],
  index: number,
) {
  const resolvedIcon = icon ?? (index === 0 ? 'home' : index === 1 ? 'banknote' : 'shield')

  switch (resolvedIcon) {
    case 'clipboardList':
      return <ClipboardList className="size-6" aria-hidden />
    case 'badgePercent':
      return <BadgePercent className="size-6" aria-hidden />
    case 'landmark':
      return <Landmark className="size-6" aria-hidden />
    case 'banknote':
      return <Banknote className="size-6" aria-hidden />
    case 'shield':
      return <ShieldCheck className="size-6" aria-hidden />
    case 'home':
    default:
      return <Home className="size-6" aria-hidden />
  }
}
