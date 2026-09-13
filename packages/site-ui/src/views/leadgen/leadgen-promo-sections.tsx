import { BadgePercent, Banknote, Check, Clock3, ClipboardList, Home, Landmark, MapPin, ShieldCheck } from "lucide-react";
import type { ElementType } from "react";
import type { LeadgenPromoContentDto } from "@starter/site-contracts";
import type { SiteImageRenderer } from "../../lib/adapters";

const primaryButtonClass =
  "inline-flex min-h-14 w-full items-center justify-center rounded-tight bg-[var(--accent)] px-7 text-center text-sm font-semibold text-white shadow-[var(--leadgen-promo-landing-shadow-primary)] transition hover:bg-[var(--accent-hover)] sm:w-auto";
export function CompactBenefitsSection({ content }: { content: LeadgenPromoContentDto }) {
  return (
    <section className="relative z-20 mx-auto w-full max-w-305 px-5 py-12 sm:px-8 sm:py-16 lg:-mt-20 lg:pb-20 lg:pt-0">
      <div className="overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-inverse)] bg-[var(--surface-card)] shadow-[var(--leadgen-promo-landing-shadow-emphasis)]">
        <div className="grid bg-[var(--leadgen-promo-landing-surface-muted)] px-6 py-7 sm:px-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-9">
          <div className="border-b border-[var(--leadgen-promo-landing-border-hover)] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <p className="text-caption font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Результат опроса</p>
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
                  <span className="text-caption font-bold tracking-[0.16em] text-[var(--leadgen-promo-landing-content-active)]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-body-emphasis font-semibold leading-tight text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-3 text-support font-medium leading-6 text-[var(--leadgen-promo-landing-content-selected)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="h-0.75 bg-[var(--accent)]" aria-hidden />
      </div>
    </section>
  );
}

export function renderHeroTitle(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title;

  const [before, ...rest] = title.split(accent);

  return (
    <>
      {before}
      <span className="text-[var(--leadgen-promo-landing-content-disabled)]">{accent}</span>
      {rest.join(accent)}
    </>
  );
}

export function normalizeBaseSectionPoint(point: LeadgenPromoContentDto["baseSection"]["points"][number]) {
  return typeof point === "string" ? { title: null, text: point } : point;
}

export function renderTrustIcon(icon: LeadgenPromoContentDto["trustItems"][number]["icon"], index: number) {
  const resolvedIcon = icon ?? (index === 0 ? "home" : index === 1 ? "banknote" : "shield");

  switch (resolvedIcon) {
    case "clipboardList":
      return <ClipboardList className="size-6" aria-hidden />;
    case "badgePercent":
      return <BadgePercent className="size-6" aria-hidden />;
    case "landmark":
      return <Landmark className="size-6" aria-hidden />;
    case "banknote":
      return <Banknote className="size-6" aria-hidden />;
    case "shield":
      return <ShieldCheck className="size-6" aria-hidden />;
    case "home":
    default:
      return <Home className="size-6" aria-hidden />;
  }
}

function renderExpertPreviewCount(label: string) {
  const [value, ...restParts] = label.split(" ");
  const description = restParts.join(" ");

  return (
    <span className="shrink-0 rounded-soft bg-[var(--accent-soft)] px-3 py-2 text-right text-[var(--accent)]">
      <span className="block text-lead font-semibold leading-none">{value}</span>
      {description ? (
        <span className="mt-1 block max-w-33 text-[10.5px] font-medium leading-[1.25] text-[var(--leadgen-promo-landing-content-overlay)]">
          {description}
        </span>
      ) : null}
    </span>
  );
}

export function BaseSectionPreview({ content, imageRenderer: ImageRenderer }: { content: LeadgenPromoContentDto; imageRenderer: SiteImageRenderer }) {
  if (!content.baseSection.preview) {
    return null;
  }

  if (content.baseSection.preview.variant === "expert") {
    const image = content.baseSection.preview.image ?? content.manager.photo;

    return (
      <div className="relative">
        <div className="absolute inset-0 translate-y-6 rounded-sm bg-[var(--text-primary)]/10 blur-2xl" aria-hidden />
        <div className="relative overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-primary)] bg-[var(--text-primary)] p-3 shadow-[var(--leadgen-promo-landing-shadow-elevated)]">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,var(--leadgen-promo-landing-effect-disabled),var(--leadgen-promo-landing-effect-overlay)_48%,var(--leadgen-promo-landing-effect-emphasis))]" aria-hidden />
          <div className="relative overflow-hidden rounded-soft border border-white/10 bg-[var(--surface-card)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--leadgen-promo-landing-border-active)] p-4">
              <div className="min-w-0">
                <p className="text-lead font-semibold leading-tight text-[var(--text-primary)] sm:text-heading-small">
                  {content.baseSection.preview.label}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-compact bg-[var(--leadgen-promo-landing-surface-strong)] px-2.5 py-1.5 text-label font-medium leading-none text-[var(--accent)]">
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
                <p className="text-lead font-semibold leading-tight">{content.manager.name}</p>
                <p className="mt-1 text-caption font-medium leading-5 text-white/76">{content.manager.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 translate-y-6 rounded-sm bg-[var(--text-primary)]/10 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-primary)] bg-[var(--text-primary)] p-3 shadow-[var(--leadgen-promo-landing-shadow-elevated)]">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,var(--leadgen-promo-landing-effect-disabled),var(--leadgen-promo-landing-effect-overlay)_48%,var(--leadgen-promo-landing-effect-emphasis))]" aria-hidden />
        <div className="relative rounded-soft border border-white/10 bg-[var(--surface-card)] p-3">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--leadgen-promo-landing-border-active)] pb-3">
            <div>
              <p className="text-caption font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{content.baseSection.preview.label}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{content.baseSection.preview.city}</p>
            </div>
            <span className="rounded-compact bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
              {content.baseSection.preview.countLabel}
            </span>
          </div>

          <div className="mt-3 grid gap-3">
            {content.apartments.slice(0, 3).map((apartment) => {
              const rooms = apartment.facts[0]?.[1];
              const area = apartment.facts[1]?.[1];

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
                    <p className="text-caption font-semibold uppercase tracking-[0.1em] text-[var(--leadgen-promo-landing-content-emphasis)]">ID {apartment.id}</p>
                    <p className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">{apartment.price}</p>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadgenFinalQuizCta({ content, city, imageRenderer: ImageRenderer, requestButton: RequestButton }: { content: LeadgenPromoContentDto; city: { nominative: string; prepositional: string }; imageRenderer: SiteImageRenderer; requestButton: ElementType }) {
  if (content.hideFinalCta) {
    return null;
  }

  if (content.finalCta) {
    const constructionPreview = content.constructionExamples?.slice(0, 3) ?? [];
    const hasConstructionPreview = constructionPreview.length > 0;
    const hasPreviewRows = hasConstructionPreview;
    const showsExpertPortrait = content.finalCta.image === content.manager.photo;

    return (
      <section id="final-cta" className="scroll-mt-28 bg-[var(--leadgen-promo-landing-surface-strong)] px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
        <div className={`mx-auto grid w-full max-w-290 overflow-hidden rounded-sm border border-[var(--leadgen-promo-landing-border-primary)] bg-[var(--leadgen-promo-landing-surface-hover)] shadow-[var(--leadgen-promo-landing-shadow-floating)] ${showsExpertPortrait ? 'lg:grid-cols-[minmax(360px,0.82fr)_minmax(500px,1.18fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)]'}`}>
          <div className={`relative overflow-hidden ${showsExpertPortrait ? 'aspect-[4/5] min-h-0 bg-[radial-gradient(circle_at_50%_28%,var(--leadgen-promo-landing-visual-secondary)_0%,var(--leadgen-promo-landing-visual-tertiary)_72%,var(--leadgen-promo-landing-visual-subtle)_100%)] sm:aspect-auto sm:min-h-95 lg:min-h-120' : 'min-h-70 bg-[var(--leadgen-promo-landing-surface-active)] sm:min-h-95 lg:min-h-120'}`}>
            <ImageRenderer
              src={content.finalCta.image}
              alt={content.finalCta.imageAlt}
              fill
              sizes="(max-width: 1024px) calc(100vw - 40px), 620px"
              className={showsExpertPortrait ? "object-cover object-center sm:object-contain sm:object-bottom sm:px-8 sm:pt-8" : "object-cover object-center"}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--leadgen-promo-landing-effect-overlay)_44%,var(--leadgen-promo-landing-effect-elevated)_100%)]" aria-hidden />
            {showsExpertPortrait ? (
              <div className="absolute bottom-4 left-4 rounded-sm border border-white/70 bg-[var(--surface-card)]/90 px-4 py-3 shadow-[var(--leadgen-promo-landing-shadow-backdrop)] backdrop-blur-sm sm:bottom-6 sm:left-6">
                <p className="text-support font-semibold leading-tight text-[var(--text-primary)]">{content.manager.name}</p>
                <p className="mt-1 text-caption font-medium text-[var(--leadgen-promo-landing-content-elevated)]">{content.manager.role}</p>
              </div>
            ) : null}
            {hasPreviewRows ? (
              <div className="absolute bottom-5 left-5 w-61.25 max-w-[calc(100%-40px)] rounded-[16px] border-[5px] border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[var(--leadgen-promo-landing-shadow-highlight)] sm:bottom-7 sm:left-7 sm:w-73">
              <div className="rounded-[11px] bg-[var(--surface-card)] p-3">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2.5">
                  <div>
                    <p className="text-caption font-semibold leading-none text-[var(--accent)]">
                      {hasConstructionPreview ? "Расчет строительства" : "Подборка новостроек"}
                    </p>
                    <p className="mt-1 text-overline font-medium leading-4 text-[var(--text-muted)]">
                      {hasConstructionPreview ? `${city.nominative} · каталог проектов` : `${city.nominative} · расчет ипотеки`}
                    </p>
                  </div>
                  <span className="rounded-tight bg-[var(--accent-soft)] px-2 py-1 text-overline font-semibold leading-none text-[var(--accent)]">
                    {hasConstructionPreview ? "смета" : "по актуальным условиям"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {constructionPreview.map((project) => (
                        <div
                          key={project.id}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-soft border border-[var(--leadgen-promo-landing-border-active)] bg-[var(--leadgen-promo-landing-surface-inverse)] px-2.5 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-caption font-semibold leading-4 text-[var(--text-primary)]">{project.material}</p>
                            <p className="mt-0.5 truncate text-micro font-medium leading-3 text-[var(--text-muted)]">{project.area} · {project.buildTime}</p>
                          </div>
                          <p className="text-right text-overline font-semibold leading-3 text-[var(--accent)]">{project.priceFrom}</p>
                        </div>
                      ))}
                </div>
                <div className="mt-3 rounded-compact bg-[var(--text-primary)] px-3 py-2 text-center text-overline font-semibold leading-none text-white">
                  {hasConstructionPreview ? "каталог и расчет в мессенджер" : "3-5 вариантов в мессенджер"}
                </div>
              </div>
              </div>
            ) : null}
          </div>

          <div className="grid content-center bg-[var(--surface-card)] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className={showsExpertPortrait ? "max-w-145" : "max-w-130"}>
              <h2 className="text-section-title font-semibold leading-section-title text-[var(--text-primary)]">
                {content.finalCta.title}
              </h2>
              {content.finalCta.bullets.length ? (
                <ul className="mt-7 grid gap-4 text-body font-medium leading-6 text-[var(--text-secondary)] sm:text-body-compact">
                  {content.finalCta.bullets.map((bullet) => {
                    const Icon = bullet.icon === "clock" ? Clock3 : Check;

                    return (
                      <li key={bullet.text} className="grid grid-cols-[26px_minmax(0,1fr)] gap-3">
                        <span className="mt-0.5 grid size-6 place-items-center rounded-compact bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <span>{bullet.text}</span>
                      </li>
                    );
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
                <p className="mx-auto mt-3 px-2 text-center text-label font-medium leading-5 text-[var(--text-muted)]">
                  {content.finalCta.microtext}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const previewApartments = content.apartments.slice(0, 3);

  return (
    <section id="final-cta" className="mx-auto w-full max-w-290 scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20">
      <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--leadgen-promo-landing-surface-selected)] shadow-[var(--leadgen-promo-landing-shadow-floating)] lg:grid lg:min-h-107.5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
        <div className="relative min-h-65 overflow-hidden bg-[var(--leadgen-promo-landing-surface-active)] sm:min-h-82.5 lg:min-h-107.5">
          <ImageRenderer
            src={content.heroBackgroundImage}
            alt="Квартира из закрытой базы агентства недвижимости"
            fill
            sizes="(max-width: 1024px) calc(100vw - 40px), 560px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--leadgen-promo-landing-effect-floating),var(--leadgen-promo-landing-effect-backdrop)_46%,var(--leadgen-promo-landing-effect-highlight))]" aria-hidden />
          <div className="absolute bottom-[-34px] right-[-6px] h-54.5 w-29.5 rotate-[-8deg] rounded-b-[28px] rounded-t-full bg-[var(--leadgen-promo-landing-surface-disabled)] shadow-[var(--leadgen-promo-landing-shadow-lowlight)] sm:right-[-16px]" aria-hidden />
          <div className="absolute bottom-7 right-5 w-43.5 rotate-[-3deg] rounded-[28px] border-[6px] border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[var(--leadgen-promo-landing-shadow-outline)] min-[420px]:right-8 min-[420px]:w-48.5 sm:right-12 lg:right-10 lg:w-52.5">
            <div className="relative overflow-hidden rounded-[22px] bg-[var(--surface-card)] p-2">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--text-primary)]/15" aria-hidden />
              <div className="rounded-soft bg-[var(--accent)] px-2 py-1 text-center text-micro-tight font-semibold leading-3 text-white">
                Подборка агентства недвижимости
              </div>
              <div className="mt-2 grid gap-2">
                {previewApartments.map((apartment) => {
                  const rooms = apartment.facts.find(([label]) => label === "Количество комнат")?.[1] ?? "квартира";
                  const area = apartment.facts.find(([label]) => label === "Общая площадь")?.[1];

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
                        <p className="truncate text-micro-tight font-semibold leading-3 text-[var(--text-primary)]">
                          {rooms}
                          {area ? `, ${area} м²` : ""}
                        </p>
                        <p className="mt-0.5 truncate text-micro-tight font-bold leading-3 text-[var(--accent)]">{apartment.price}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-2 rounded-compact bg-[var(--accent-soft)] px-2 py-1.5 text-center text-micro-tight font-semibold leading-3 text-[var(--accent)]">
                5-10 вариантов в мессенджер
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-center px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <h2 className="text-section-title font-semibold leading-section-title text-[var(--leadgen-promo-landing-content-floating)]">
            Пройдите тест за одну минуту и получите подборку квартир из{" "}
            <span className="text-[var(--accent)]">закрытой базы</span> по Вашим параметрам
          </h2>
          <ul className="mt-8 grid gap-5 text-sm font-medium leading-6 text-[var(--leadgen-promo-landing-content-muted)] sm:text-body-compact">
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
              <span>Подборку с актуальными ценами и фотографиями отправим в удобный мессенджер в течение 10 минут</span>
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
  );
}

export function LeadgenPromoFooter({ copyright, registry, privacyModal: PrivacyModal }: { copyright: string; registry: string; privacyModal: ElementType }) {
  return (
    <footer id="leadgen-footer" className="bg-[var(--leadgen-promo-landing-surface-emphasis)] text-white">
      <div className="mx-auto w-full max-w-290 px-5 py-8 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 border-t border-white/12 pt-5 text-xs font-medium leading-5 text-white/58 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span>{copyright}</span>
            <span>{registry}</span>
          </p>
          <div className="sm:text-right">
            <PrivacyModal />
          </div>
        </div>
      </div>
    </footer>
  );
}
