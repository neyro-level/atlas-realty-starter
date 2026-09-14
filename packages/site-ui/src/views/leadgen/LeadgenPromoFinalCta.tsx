import { Check, Clock3 } from 'lucide-react'
import type { ElementType } from 'react'
import type { LeadgenPromoContentDto } from '@starter/site-contracts'
import type { SiteImageRenderer } from '../../lib/adapters'

const primaryButtonClass =
  'inline-flex min-h-14 w-full items-center justify-center rounded-tight bg-[var(--accent)] px-7 text-center text-body font-semibold text-white shadow-[var(--leadgen-promo-landing-shadow-primary)] transition hover:bg-[var(--accent-hover)] sm:w-auto'

export function LeadgenFinalQuizCta({
  content,
  city,
  imageRenderer: ImageRenderer,
  requestButton: RequestButton,
}: {
  content: LeadgenPromoContentDto
  city: { nominative: string; prepositional: string }
  imageRenderer: SiteImageRenderer
  requestButton: ElementType
}) {
  if (content.hideFinalCta) {
    return null
  }

  if (content.finalCta) {
    const constructionPreview = content.constructionExamples?.slice(0, 3) ?? []
    const hasConstructionPreview = constructionPreview.length > 0
    const hasPreviewRows = hasConstructionPreview
    const showsExpertPortrait = content.finalCta.image === content.manager.photo

    return (
      <section
        id="final-cta"
        className="scroll-mt-28 bg-[var(--leadgen-promo-landing-surface-strong)] px-5 py-12 sm:px-8 sm:py-20 lg:py-24"
      >
        <div
          className={`mx-auto grid w-full max-w-290 overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-primary)] bg-[var(--leadgen-promo-landing-surface-hover)] shadow-[var(--leadgen-promo-landing-shadow-floating)] ${showsExpertPortrait ? 'lg:grid-cols-[minmax(360px,0.82fr)_minmax(500px,1.18fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)]'}`}
        >
          <div
            className={`relative overflow-hidden ${showsExpertPortrait ? 'aspect-[4/5] min-h-0 bg-[radial-gradient(circle_at_50%_28%,var(--leadgen-promo-landing-visual-secondary)_0%,var(--leadgen-promo-landing-visual-tertiary)_72%,var(--leadgen-promo-landing-visual-subtle)_100%)] sm:aspect-auto sm:min-h-95 lg:min-h-120' : 'min-h-70 bg-[var(--leadgen-promo-landing-surface-active)] sm:min-h-95 lg:min-h-120'}`}
          >
            <ImageRenderer
              src={content.finalCta.image}
              alt={content.finalCta.imageAlt}
              fill
              sizes="(max-width: 1024px) calc(100vw - 40px), 620px"
              className={
                showsExpertPortrait
                  ? 'object-cover object-center sm:object-contain sm:object-bottom sm:px-8 sm:pt-8'
                  : 'object-cover object-center'
              }
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,var(--leadgen-promo-landing-effect-overlay)_44%,var(--leadgen-promo-landing-effect-elevated)_100%)]"
              aria-hidden
            />
            {showsExpertPortrait ? (
              <div className="absolute bottom-4 left-4 rounded-sm border border-white/70 bg-[var(--surface-card)]/90 px-4 py-3 shadow-[var(--leadgen-promo-landing-shadow-backdrop)] backdrop-blur-sm sm:bottom-6 sm:left-6">
                <p className="text-support font-semibold leading-tight-copy text-[var(--text-primary)]">
                  {content.manager.name}
                </p>
                <p className="mt-1 text-caption font-medium text-[var(--leadgen-promo-landing-content-elevated)]">
                  {content.manager.role}
                </p>
              </div>
            ) : null}
            {hasPreviewRows ? (
              <div className="absolute bottom-5 left-5 w-61.25 max-w-[calc(100%-40px)] rounded-[16px] border-[5px] border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[var(--leadgen-promo-landing-shadow-highlight)] sm:bottom-7 sm:left-7 sm:w-73">
                <div className="rounded-[11px] bg-[var(--surface-card)] p-3">
                  <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2.5">
                    <div>
                      <p className="text-caption font-semibold leading-flat text-[var(--accent)]">
                        {hasConstructionPreview ? 'Расчет строительства' : 'Подборка новостроек'}
                      </p>
                      <p className="mt-1 text-overline font-medium leading-step-small text-[var(--text-muted)]">
                        {hasConstructionPreview
                          ? `${city.nominative} · каталог проектов`
                          : `${city.nominative} · расчет ипотеки`}
                      </p>
                    </div>
                    <span className="rounded-tight bg-[var(--accent-soft)] px-2 py-1 text-overline font-semibold leading-flat text-[var(--accent)]">
                      {hasConstructionPreview ? 'смета' : 'по актуальным условиям'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {constructionPreview.map((project) => (
                      <div
                        key={project.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-soft border border-[var(--leadgen-promo-landing-border-active)] bg-[var(--leadgen-promo-landing-surface-inverse)] px-2.5 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-caption font-semibold leading-step-small text-[var(--text-primary)]">
                            {project.material}
                          </p>
                          <p className="mt-0.5 truncate text-micro font-medium leading-step-compact text-[var(--text-muted)]">
                            {project.area} · {project.buildTime}
                          </p>
                        </div>
                        <p className="text-right text-overline font-semibold leading-step-compact text-[var(--accent)]">
                          {project.priceFrom}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-compact bg-[var(--text-primary)] px-3 py-2 text-center text-overline font-semibold leading-flat text-white">
                    {hasConstructionPreview
                      ? 'каталог и расчет в мессенджер'
                      : '3-5 вариантов в мессенджер'}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid content-center bg-[var(--surface-card)] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className={showsExpertPortrait ? 'max-w-145' : 'max-w-130'}>
              <h2 className="text-section-title font-semibold leading-section-title text-[var(--text-primary)]">
                {content.finalCta.title}
              </h2>
              {content.finalCta.bullets.length ? (
                <ul className="mt-7 grid gap-4 text-body font-medium leading-step-copy text-[var(--text-secondary)] sm:text-body-compact">
                  {content.finalCta.bullets.map((bullet) => {
                    const Icon = bullet.icon === 'clock' ? Clock3 : Check

                    return (
                      <li key={bullet.text} className="grid grid-cols-[26px_minmax(0,1fr)] gap-3">
                        <span className="mt-0.5 grid size-6 place-items-center rounded-compact bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <span>{bullet.text}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>

            <div className="mt-8 w-full max-w-110">
              <RequestButton
                className={`${primaryButtonClass} !w-full whitespace-normal sm:whitespace-nowrap`}
                mode="quiz"
                title={content.finalCta.modalTitle}
                submitLabel={content.quiz.submitLabel}
                formType={content.finalCta.formType}
                source={content.finalCta.source}
              >
                {content.finalCta.cta}
              </RequestButton>
              {content.finalCta.microtext ? (
                <p className="mx-auto mt-3 px-2 text-center text-label font-medium leading-step-body text-[var(--text-muted)]">
                  {content.finalCta.microtext}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const previewApartments = content.apartments.slice(0, 3)

  return (
    <section
      id="final-cta"
      className="mx-auto w-full max-w-290 scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--leadgen-promo-landing-surface-selected)] shadow-[var(--leadgen-promo-landing-shadow-floating)] lg:grid lg:min-h-107.5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
        <div className="relative min-h-65 overflow-hidden bg-[var(--leadgen-promo-landing-surface-active)] sm:min-h-82.5 lg:min-h-107.5">
          <ImageRenderer
            src={content.heroBackgroundImage}
            alt="Квартира из закрытой базы агентства недвижимости"
            fill
            sizes="(max-width: 1024px) calc(100vw - 40px), 560px"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,var(--leadgen-promo-landing-effect-floating),var(--leadgen-promo-landing-effect-backdrop)_46%,var(--leadgen-promo-landing-effect-highlight))]"
            aria-hidden
          />
          <div
            className="absolute bottom-[-34px] right-[-6px] h-54.5 w-29.5 rotate-[-8deg] rounded-b-[28px] rounded-t-full bg-[var(--leadgen-promo-landing-surface-disabled)] shadow-[var(--leadgen-promo-landing-shadow-lowlight)] sm:right-[-16px]"
            aria-hidden
          />
          <div className="absolute bottom-7 right-5 w-43.5 rotate-[-3deg] rounded-[28px] border-[6px] border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[var(--leadgen-promo-landing-shadow-outline)] min-[420px]:right-8 min-[420px]:w-48.5 sm:right-12 lg:right-10 lg:w-52.5">
            <div className="relative overflow-hidden rounded-[22px] bg-[var(--surface-card)] p-2">
              <div
                className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--text-primary)]/15"
                aria-hidden
              />
              <div className="rounded-soft bg-[var(--accent)] px-2 py-1 text-center text-micro-tight font-semibold leading-step-compact text-white">
                Подборка агентства недвижимости
              </div>
              <div className="mt-2 grid gap-2">
                {previewApartments.map((apartment) => {
                  const rooms =
                    apartment.facts.find(([label]) => label === 'Количество комнат')?.[1] ??
                    'квартира'
                  const area = apartment.facts.find(([label]) => label === 'Общая площадь')?.[1]

                  return (
                    <article
                      key={apartment.id}
                      className="grid grid-cols-[46px_minmax(0,1fr)] gap-2 rounded-compact border border-[var(--leadgen-promo-landing-border-selected)] bg-[var(--surface-card-soft)] p-1.5"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-tight bg-[var(--leadgen-promo-landing-surface-overlay)]">
                        <ImageRenderer
                          src={apartment.image}
                          alt="Квартира из подборки"
                          fill
                          unoptimized
                          sizes="52px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="truncate text-micro-tight font-semibold leading-step-compact text-[var(--text-primary)]">
                          {rooms}
                          {area ? `, ${area} м²` : ''}
                        </p>
                        <p className="mt-0.5 truncate text-micro-tight font-bold leading-step-compact text-[var(--accent)]">
                          {apartment.price}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
              <div className="mt-2 rounded-compact bg-[var(--accent-soft)] px-2 py-1.5 text-center text-micro-tight font-semibold leading-step-compact text-[var(--accent)]">
                5-10 вариантов в мессенджер
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-center px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <h2 className="text-section-title font-semibold leading-section-title text-[var(--leadgen-promo-landing-content-floating)]">
            Пройдите тест за одну минуту и получите подборку квартир из{' '}
            <span className="text-[var(--accent)]">закрытой базы</span> по Вашим параметрам
          </h2>
          <ul className="mt-8 grid gap-5 text-body font-medium leading-step-copy text-[var(--leadgen-promo-landing-content-muted)] sm:text-body-compact">
            <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 grid size-[18px] place-items-center rounded-micro bg-[var(--accent)] text-white">
                <Check className="size-3.5" aria-hidden />
              </span>
              <span>{content.hero.microtext}</span>
            </li>
            <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 grid size-[18px] place-items-center rounded-micro bg-[var(--accent)] text-white">
                <Check className="size-3.5" aria-hidden />
              </span>
              <span>
                Подборку с актуальными ценами и фотографиями отправим в удобный мессенджер в течение
                10 минут
              </span>
            </li>
          </ul>
          <div className="mt-8">
            <RequestButton
              className={`${primaryButtonClass} sm:w-82.5`}
              mode="quiz"
              title={content.quiz.title}
              submitLabel="Получить подборку"
              formType={`${content.formPrefix}_final_quiz`}
            >
              Пройти тест и получить подборку
            </RequestButton>
          </div>
        </div>
      </div>
    </section>
  )
}
