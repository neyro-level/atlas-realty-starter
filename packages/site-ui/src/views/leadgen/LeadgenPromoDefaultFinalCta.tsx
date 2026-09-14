import { Check } from 'lucide-react'
import {
  leadgenPrimaryButtonClass,
  type LeadgenFinalQuizCtaProps,
} from './leadgen-promo-final-cta.shared'

export function LeadgenPromoDefaultFinalCta({
  content,
  imageRenderer: ImageRenderer,
  requestButton: RequestButton,
}: LeadgenFinalQuizCtaProps) {
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
              className={`${leadgenPrimaryButtonClass} sm:w-82.5`}
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
