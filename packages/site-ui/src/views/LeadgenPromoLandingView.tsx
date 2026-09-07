import { Banknote, Check, Home, Landmark, ShieldCheck } from "lucide-react";
import type { ElementType } from "react";
import type { LeadgenPromoContentDto } from "@starter/site-contracts";
import type { SiteImageRenderer } from "../lib/adapters";
import { BaseSectionPreview, CompactBenefitsSection, LeadgenFinalQuizCta, LeadgenPromoFooter, normalizeBaseSectionPoint, renderHeroTitle, renderTrustIcon } from "./leadgen-promo-sections";

const primaryButtonClass =
  "inline-flex min-h-14 w-full items-center justify-center rounded-[5px] bg-[var(--accent)] px-7 text-center text-sm font-semibold text-white shadow-[var(--leadgen-promo-landing-shadow-01)] transition hover:bg-[var(--accent-hover)] sm:w-auto";

const leadgenHeroImage = "/images/agency-home-secondary-hero.webp";

export type LeadgenPromoLandingAdapters = {
  PromoHeader: ElementType;
  RequestButton: ElementType;
  CurrentDateBadge: ElementType;
  ConstructionProjectShowcase: ElementType;
  InlinePhoneForm: ElementType;
  ApartmentShowcase: ElementType;
  QuizModal: ElementType;
  SimpleRequestModal: ElementType;
  PrivacyModal: ElementType;
};

type LeadgenPromoLandingViewProps = {
  content: LeadgenPromoContentDto;
  compact?: boolean;
  adapters: LeadgenPromoLandingAdapters;
  imageRenderer: SiteImageRenderer;
  copyright: string;
  registry: string;
  city: { nominative: string; genitive: string; prepositional: string };
};

export function LeadgenPromoLandingView({
  content,
  compact = false,
  adapters,
  imageRenderer: ImageRenderer,
  copyright,
  registry,
  city,
}: LeadgenPromoLandingViewProps) {
  const { PromoHeader, RequestButton, CurrentDateBadge, ConstructionProjectShowcase, InlinePhoneForm, ApartmentShowcase, QuizModal, SimpleRequestModal, PrivacyModal } = adapters;
  const heroBackgroundImage = content.heroBackgroundImage ?? leadgenHeroImage;
  const isPromoNovostroy2 = content.route === "/promo/novostroyki";
  const shouldRenderStandardExamples = !content.hideStandardExamples && !content.constructionExamples?.length;
  const bonusSection = content.bonusSection ?? {
    title: "При обращении к нам, Вы так же получите:",
    formTitle: "Получить подборку бесплатно",
    submitLabel: "Смотреть базу бесплатно",
    message:
      `Клиент просит открыть закрытую базу квартир в ${city.prepositional}.`,
  };

  return (
    <main className="bg-white font-sans text-[var(--text-primary)]">
      <PromoHeader content={content} />
      <section
        id="leadgen-hero"
        className="relative isolate overflow-hidden bg-[var(--leadgen-promo-landing-surface-01)] text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, var(--leadgen-promo-landing-effect-01) 0%, var(--leadgen-promo-landing-effect-02) 44%, var(--leadgen-promo-landing-effect-03) 100%), linear-gradient(180deg, var(--leadgen-promo-landing-effect-04) 0%, var(--leadgen-promo-landing-effect-05) 100%), url("${heroBackgroundImage}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,var(--leadgen-promo-landing-effect-06)_0%,var(--leadgen-promo-landing-effect-07)_38%)]" aria-hidden />
        <div
          className={`relative mx-auto flex w-full max-w-[1160px] items-center px-5 pb-24 pt-[112px] sm:px-8 sm:pb-28 sm:pt-[118px] lg:pb-36 lg:pt-[142px] ${isPromoNovostroy2 ? "min-h-[680px] sm:min-h-[760px]" : "min-h-[660px] sm:min-h-[740px]"}`}
        >
          <div className="mx-auto w-full max-w-[1120px] text-center">
            <p className="relative inline-flex max-w-full overflow-hidden rounded-[10px] border border-white/14 bg-white/[0.07] px-3.5 py-2.5 text-[13px] font-semibold text-white/92 shadow-[var(--leadgen-promo-landing-shadow-02)] backdrop-blur-lg min-[380px]:text-sm sm:px-4 sm:text-[15px]">
              <span className="absolute inset-0 bg-[linear-gradient(110deg,var(--leadgen-promo-landing-effect-08)_0%,var(--leadgen-promo-landing-effect-09)_46%,var(--leadgen-promo-landing-effect-10)_100%)]" aria-hidden />
              <span className="absolute -left-8 top-1/2 size-14 -translate-y-1/2 rounded-full bg-[var(--accent)]/18 blur-2xl" aria-hidden />
              <span className="leadgen-typing-text relative z-10">
                {content.hero.eyebrow}
              </span>
            </p>
            <h1 className="mx-auto mt-6 max-w-[1080px] text-[25px] font-extrabold leading-[1.08] tracking-[0] text-white [text-wrap:balance] min-[390px]:text-[27px] sm:text-[34px] lg:text-[41px] xl:text-[45px]">
              {renderHeroTitle(content.hero.h1, content.hero.h1Accent)}
            </h1>
            {content.hero.subtitle ? (
              <p className="mx-auto mt-5 max-w-[820px] text-[15px] font-medium leading-6 text-white/78 [text-wrap:balance] sm:text-[17px] sm:leading-7">
                {content.hero.subtitle}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col items-center">
              <RequestButton
                className={`${primaryButtonClass} shadow-[var(--leadgen-promo-landing-shadow-03)]`}
                mode="quiz"
                title={content.hero.modalTitle}
                subtitle={content.hero.modalSubtitle}
                submitLabel="Получить подборку"
                formType={`${content.formPrefix}_hero_request`}
              >
                {content.hero.cta}
              </RequestButton>
              <p className="mt-4 text-xs font-medium text-white/74">{content.hero.microtext}</p>
            </div>
          </div>
        </div>
        {content.hero.badge ? (
          <div className="pointer-events-none absolute bottom-8 right-5 hidden rounded-[9px] border border-white/16 bg-white/12 px-4 py-3 text-left text-[12px] font-semibold leading-tight text-white/88 shadow-[var(--leadgen-promo-landing-shadow-04)] backdrop-blur-md sm:right-8 lg:block">
            {content.hero.badge}
          </div>
        ) : null}
      </section>

      {content.hideAfterRequest ? null : compact ? (
        <CompactBenefitsSection content={content} />
      ) : (
        <section className="pointer-events-none relative z-20 mx-auto -mt-32 w-full max-w-[1220px] px-5 pb-14 pt-10 sm:-mt-44 sm:px-8 sm:pb-16 sm:pt-14 lg:-mt-52 lg:pt-16">
          <div className="mx-auto max-w-[760px] text-center text-white">
            <h2 className="mx-auto max-w-[720px] text-[24px] font-semibold leading-tight text-white sm:text-[30px]">
              {content.afterRequestTitle}
            </h2>
          </div>

          <div className="pointer-events-auto mt-7 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3">
            {content.trustItems.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[8px] border border-[var(--leadgen-promo-landing-border-01)] bg-white p-4 shadow-[var(--leadgen-promo-landing-shadow-05)] transition hover:-translate-y-1 hover:border-[var(--leadgen-promo-landing-border-02)] hover:shadow-[var(--leadgen-promo-landing-shadow-06)] sm:min-h-[214px] sm:p-6 sm:shadow-[var(--leadgen-promo-landing-shadow-07)]"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--accent)]" aria-hidden />
                <div className="absolute right-4 top-4 text-[11px] font-bold tracking-[0.18em] text-[var(--leadgen-promo-landing-content-01)]" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex items-start justify-between gap-4 pr-10">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[7px] border border-[var(--leadgen-promo-landing-border-01)] bg-[var(--leadgen-promo-landing-surface-02)] text-[var(--accent)] shadow-[var(--leadgen-promo-landing-shadow-08)] sm:size-12">
                    {renderTrustIcon(item.icon, index)}
                  </span>
                </div>
                <h3 className="mt-4 max-w-none pr-7 text-base font-semibold leading-tight text-[var(--text-primary)] [text-wrap:balance] sm:mt-6 sm:text-[17px]">{item.title}</h3>
                <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--leadgen-promo-landing-content-02)] sm:mt-3 sm:text-sm sm:leading-6">{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {compact || content.hideBaseSection ? null : (
        <section
          id="closed-base"
          data-layout={content.baseSection.preview ? "preview" : "service-panel"}
          className={`mx-auto grid w-full max-w-[1160px] scroll-mt-28 gap-8 px-5 py-14 sm:gap-10 sm:px-8 sm:py-16 lg:py-20 ${content.baseSection.preview ? "xl:grid-cols-[minmax(0,1fr)_430px] xl:items-center" : "lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-14 xl:gap-20"}`}
        >
          <div className={content.baseSection.preview ? "max-w-[690px]" : "max-w-[460px] lg:sticky lg:top-28"}>
            <h2 className="text-[28px] font-bold leading-[1.08] text-[var(--text-primary)] min-[420px]:text-[31px] sm:text-[42px]">
              <span className="block">{content.baseSection.title}</span>
              {content.baseSection.accentTitle ? (
                <span className="block text-[var(--accent)]">{content.baseSection.accentTitle}</span>
              ) : null}
            </h2>
            <p className={`${content.baseSection.preview ? "mt-8 font-semibold text-[var(--text-primary)]" : "mt-5 text-[var(--leadgen-promo-landing-content-03)]"} text-[17px] leading-7`}>
              {content.baseSection.subtitle}
            </p>
            {content.baseSection.badge ? (
              <p className="mt-6 flex w-full items-center gap-3 rounded-[8px] bg-[var(--accent)] px-4 py-3 text-[13px] font-semibold leading-5 text-white shadow-[var(--leadgen-promo-landing-shadow-09)] sm:inline-flex sm:w-auto sm:px-5 sm:text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/16" aria-hidden>
                  <Check className="size-3.5" />
                </span>
                <span>{content.baseSection.badge}</span>
              </p>
            ) : null}
            {content.baseSection.preview ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {content.baseSection.points.map((point, index) => {
                  const item = normalizeBaseSectionPoint(point);

                  return (
                    <div
                      key={`${item.title ?? "point"}-${item.text}`}
                      className="group relative overflow-hidden rounded-[8px] border border-[var(--leadgen-promo-landing-border-03)] bg-white p-4 shadow-[var(--leadgen-promo-landing-shadow-10)]"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="grid size-8 place-items-center rounded-[6px] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Check className="size-4" aria-hidden />
                        </span>
                        <span className="text-[11px] font-bold text-[var(--leadgen-promo-landing-content-04)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      {item.title ? <h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.title}</h3> : null}
                      <p className={`${item.title ? "mt-2" : ""} text-[13px] font-medium leading-6 text-[var(--leadgen-promo-landing-content-05)]`}>{item.text}</p>
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--accent)] opacity-0 transition group-hover:opacity-100" aria-hidden />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {content.baseSection.preview ? (
            <BaseSectionPreview content={content} imageRenderer={ImageRenderer} />
          ) : (
            <div className="overflow-hidden rounded-[8px] border border-[var(--leadgen-promo-landing-border-04)] bg-[var(--leadgen-promo-landing-surface-03)] px-5 sm:px-7 lg:px-8">
              {content.baseSection.points.map((point, index) => {
                const item = normalizeBaseSectionPoint(point);

                return (
                  <article
                    key={`${item.title ?? "point"}-${item.text}`}
                    className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 border-b border-[var(--leadgen-promo-landing-border-05)] py-6 last:border-b-0 sm:grid-cols-[42px_44px_minmax(0,1fr)] sm:items-center sm:gap-x-5 sm:py-7"
                  >
                    <span className="pt-1 text-[12px] font-bold tracking-[0.14em] text-[var(--accent)] sm:pt-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="hidden size-11 place-items-center rounded-[7px] border border-[var(--leadgen-promo-landing-border-06)] bg-white text-[var(--accent)] sm:grid">
                      {index === 0 ? <Home className="size-5" aria-hidden /> : null}
                      {index === 1 ? <Landmark className="size-5" aria-hidden /> : null}
                      {index === 2 ? <ShieldCheck className="size-5" aria-hidden /> : null}
                    </span>
                    <div>
                      {item.title ? <h3 className="text-[15px] font-semibold leading-6 text-[var(--leadgen-promo-landing-content-06)] sm:text-base">{item.title}</h3> : null}
                      <p className={`${item.title ? "mt-1.5" : "font-semibold"} text-[14px] leading-6 text-[var(--leadgen-promo-landing-content-07)] sm:text-[15px]`}>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {!compact && content.constructionExamples?.length ? (
        <section id="examples" className="mx-auto w-full max-w-[1160px] scroll-mt-28 px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-[780px] whitespace-pre-line text-[28px] font-bold leading-[1.08] text-[var(--text-primary)] min-[420px]:text-[31px] sm:text-[42px]">
              {content.examplesTitle}
            </h2>
            <CurrentDateBadge className="mt-0 shrink-0 self-start sm:self-auto" />
          </div>

          <ConstructionProjectShowcase
            examples={content.constructionExamples}
            formPrefix={content.formPrefix}
            modalTitle={content.hero.modalTitle}
            submitLabel={content.quiz.submitLabel}
          />
        </section>
      ) : null}

      {compact || content.hideBonusSection ? null : (
        <section className="mx-auto w-full max-w-[1160px] px-5 pb-14 sm:px-8 sm:pb-16">
          <div className="relative overflow-hidden rounded-[8px] border border-[var(--leadgen-promo-landing-border-01)] bg-[var(--leadgen-promo-landing-surface-04)] p-4 shadow-[var(--leadgen-promo-landing-shadow-11)] sm:p-6 lg:p-7">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center">
              <div>
                <p className="max-w-[620px] text-[19px] font-semibold leading-tight text-[var(--text-secondary)] sm:text-[21px]">
                  {bonusSection.title}
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {content.bonusItems.map((item, index) => {
                    const Icon = index === 0 ? ShieldCheck : Banknote;

                    return (
                      <div
                        key={item}
                        className="grid min-h-[132px] grid-cols-[38px_minmax(0,1fr)] gap-4 rounded-[8px] border border-[var(--leadgen-promo-landing-border-04)] bg-white p-4 shadow-[var(--leadgen-promo-landing-shadow-12)]"
                      >
                        <span className="grid size-9 place-items-center rounded-[6px] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon className="size-[18px]" aria-hidden />
                        </span>
                        <p className="text-[13px] font-medium leading-6 text-[var(--leadgen-promo-landing-content-08)]">{item}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <InlinePhoneForm
                formType={`${content.formPrefix}_base_inline`}
                title={bonusSection.formTitle}
                submitLabel={bonusSection.submitLabel}
                message={bonusSection.message}
              />
            </div>
          </div>
        </section>
      )}

      {!compact && shouldRenderStandardExamples ? (
        <section id="examples" className="mx-auto w-full max-w-[1160px] scroll-mt-28 px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-[820px] whitespace-pre-line text-[28px] font-bold leading-[1.08] text-[var(--text-primary)] min-[420px]:text-[31px] sm:text-[42px]">
              {content.examplesTitle}
            </h2>
            <CurrentDateBadge className="mt-0 shrink-0 self-start sm:self-auto" />
          </div>

          <ApartmentShowcase apartments={content.apartments} formPrefix={content.formPrefix} />
        </section>
      ) : null}

      {compact ? null : <LeadgenFinalQuizCta content={content} city={city} imageRenderer={ImageRenderer} requestButton={RequestButton} />}

      <LeadgenPromoFooter copyright={copyright} registry={registry} privacyModal={PrivacyModal} />
      <QuizModal content={content} />
      <SimpleRequestModal />
    </main>
  );
}
