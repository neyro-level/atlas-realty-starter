import { MapPin } from 'lucide-react'
import type { LeadgenPromoContentDto } from '@starter/site-contracts'
import type { SiteImageRenderer } from '../../lib/adapters'

function renderExpertPreviewCount(label: string) {
  const [value, ...restParts] = label.split(' ')
  const description = restParts.join(' ')

  return (
    <span className="shrink-0 rounded-soft bg-[var(--accent-soft)] px-3 py-2 text-right text-[var(--accent)]">
      <span className="block text-lead font-semibold leading-flat">{value}</span>
      {description ? (
        <span className="mt-1 block max-w-33 text-caption-relaxed font-medium leading-tight-copy text-[var(--leadgen-promo-landing-content-overlay)]">
          {description}
        </span>
      ) : null}
    </span>
  )
}

export function BaseSectionPreview({
  content,
  imageRenderer: ImageRenderer,
}: {
  content: LeadgenPromoContentDto
  imageRenderer: SiteImageRenderer
}) {
  if (!content.baseSection.preview) {
    return null
  }

  if (content.baseSection.preview.variant === 'expert') {
    const image = content.baseSection.preview.image ?? content.manager.photo

    return (
      <div className="relative">
        <div
          className="absolute inset-0 translate-y-6 rounded-sm bg-[var(--text-primary)]/10 blur-2xl"
          aria-hidden
        />
        <div className="relative overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-primary)] bg-[var(--text-primary)] p-3 shadow-[var(--leadgen-promo-landing-shadow-elevated)]">
          <div
            className="absolute inset-0 bg-[linear-gradient(145deg,var(--leadgen-promo-landing-effect-disabled),var(--leadgen-promo-landing-effect-overlay)_48%,var(--leadgen-promo-landing-effect-emphasis))]"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-soft border border-white/10 bg-[var(--surface-card)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--leadgen-promo-landing-border-active)] p-4">
              <div className="min-w-0">
                <p className="text-lead font-semibold leading-tight-copy text-[var(--text-primary)] sm:text-heading-small">
                  {content.baseSection.preview.label}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-compact bg-[var(--leadgen-promo-landing-surface-strong)] px-2.5 py-1.5 text-label font-medium leading-flat text-[var(--accent)]">
                  <MapPin className="size-3.5" aria-hidden />
                  {content.baseSection.preview.city}
                </p>
              </div>
              {renderExpertPreviewCount(content.baseSection.preview.countLabel)}
            </div>
            <div className="relative min-h-102.5 overflow-hidden bg-[var(--leadgen-promo-landing-surface-subtle)] sm:min-h-130 lg:min-h-140">
              <ImageRenderer
                src={image}
                alt={`${content.manager.name}, ${content.manager.role}`}
                fill
                sizes="(max-width: 1024px) calc(100vw - 40px), 430px"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,var(--leadgen-promo-landing-effect-overlay)_0%,var(--leadgen-promo-landing-effect-contrast)_100%)] p-5 pt-24 text-white">
                <p className="text-lead font-semibold leading-tight-copy">{content.manager.name}</p>
                <p className="mt-1 text-caption font-medium leading-step-body text-white/76">
                  {content.manager.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="absolute inset-0 translate-y-6 rounded-sm bg-[var(--text-primary)]/10 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-primary)] bg-[var(--text-primary)] p-3 shadow-[var(--leadgen-promo-landing-shadow-elevated)]">
        <div
          className="absolute inset-0 bg-[linear-gradient(145deg,var(--leadgen-promo-landing-effect-disabled),var(--leadgen-promo-landing-effect-overlay)_48%,var(--leadgen-promo-landing-effect-emphasis))]"
          aria-hidden
        />
        <div className="relative rounded-soft border border-white/10 bg-[var(--surface-card)] p-3">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--leadgen-promo-landing-border-active)] pb-3">
            <div>
              <p className="text-caption font-bold uppercase tracking-overline text-[var(--accent)]">
                {content.baseSection.preview.label}
              </p>
              <p className="mt-1 text-body font-semibold text-[var(--text-primary)]">
                {content.baseSection.preview.city}
              </p>
            </div>
            <span className="rounded-compact bg-[var(--accent-soft)] px-3 py-2 text-label font-semibold text-[var(--accent)]">
              {content.baseSection.preview.countLabel}
            </span>
          </div>

          <div className="mt-3 grid gap-3">
            {content.apartments.slice(0, 3).map((apartment) => {
              const rooms = apartment.facts[0]?.[1]
              const area = apartment.facts[1]?.[1]

              return (
                <article
                  key={apartment.id}
                  className="grid grid-cols-[82px_minmax(0,1fr)] gap-3 rounded-soft border border-[var(--leadgen-promo-landing-border-active)] bg-[var(--leadgen-promo-landing-surface-inverse)] p-2"
                >
                  <ImageRenderer
                    src={apartment.image}
                    alt={`Квартира ID ${apartment.id}`}
                    width={164}
                    height={126}
                    unoptimized
                    sizes="82px"
                    className="h-19 w-20.5 rounded-compact object-cover"
                  />
                  <div className="min-w-0 py-1">
                    <p className="text-caption font-semibold uppercase tracking-caps text-[var(--leadgen-promo-landing-content-emphasis)]">
                      ID {apartment.id}
                    </p>
                    <p className="mt-1 truncate text-body font-bold text-[var(--text-primary)]">
                      {apartment.price}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rooms ? (
                        <span className="rounded-tight bg-[var(--surface-card)] px-2 py-1 text-caption font-medium text-[var(--leadgen-promo-landing-content-contrast)] shadow-[var(--leadgen-promo-landing-shadow-inset)]">
                          {rooms}
                        </span>
                      ) : null}
                      {area ? (
                        <span className="rounded-tight bg-[var(--surface-card)] px-2 py-1 text-caption font-medium text-[var(--leadgen-promo-landing-content-contrast)] shadow-[var(--leadgen-promo-landing-shadow-inset)]">
                          {area} м²
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
