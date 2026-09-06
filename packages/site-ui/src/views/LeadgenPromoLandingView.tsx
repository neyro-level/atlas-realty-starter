import { BadgePercent, Banknote, Check, Clock3, ClipboardList, Home, Landmark, MapPin, ShieldCheck } from "lucide-react";
import type { ElementType } from "react";
import type { LeadgenPromoContentDto } from "@starter/site-contracts";
import type { SiteImageRenderer } from "../lib/adapters";

const primaryButtonClass =
  "inline-flex min-h-14 w-full items-center justify-center rounded-[5px] bg-[var(--accent)] px-7 text-center text-sm font-semibold text-white shadow-[0_10px_22px_rgba(138,21,21,0.24)] transition hover:bg-[var(--accent-hover)] sm:w-auto";

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
};

export function LeadgenPromoLandingView({
  content,
  compact = false,
  adapters,
  imageRenderer: ImageRenderer,
  copyright,
  registry,
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
      "Клиент просит открыть закрытую базу квартир в Краснодаре.",
  };

  return (
    <main className="bg-white font-sans text-[var(--text-primary)]">
      <PromoHeader content={content} />
      <section
        id="leadgen-hero"
        className="relative isolate overflow-hidden bg-[var(--palette-111)] text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(14,14,15,0.78) 0%, rgba(14,14,15,0.66) 44%, rgba(14,14,15,0.38) 100%), linear-gradient(180deg, rgba(14,14,15,0.22) 0%, rgba(14,14,15,0.72) 100%), url("${heroBackgroundImage}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(138,21,21,0.26)_0%,rgba(138,21,21,0)_38%)]" aria-hidden />
        <div
          className={`relative mx-auto flex w-full max-w-[1160px] items-center px-5 pb-24 pt-[112px] sm:px-8 sm:pb-28 sm:pt-[118px] lg:pb-36 lg:pt-[142px] ${isPromoNovostroy2 ? "min-h-[680px] sm:min-h-[760px]" : "min-h-[660px] sm:min-h-[740px]"}`}
        >
          <div className="mx-auto w-full max-w-[1120px] text-center">
            <p className="relative inline-flex max-w-full overflow-hidden rounded-[10px] border border-white/14 bg-white/[0.07] px-3.5 py-2.5 text-[13px] font-semibold text-white/92 shadow-[0_12px_34px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-lg min-[380px]:text-sm sm:px-4 sm:text-[15px]">
              <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_46%,rgba(255,255,255,0.07)_100%)]" aria-hidden />
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
                className={`${primaryButtonClass} shadow-[0_18px_44px_rgba(0,0,0,0.28)]`}
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
          <div className="pointer-events-none absolute bottom-8 right-5 hidden rounded-[9px] border border-white/16 bg-white/12 px-4 py-3 text-left text-[12px] font-semibold leading-tight text-white/88 shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-md sm:right-8 lg:block">
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
                className="group relative overflow-hidden rounded-[8px] border border-[var(--palette-eadede)] bg-white p-4 shadow-[0_18px_46px_rgba(23,22,26,0.14)] transition hover:-translate-y-1 hover:border-[var(--palette-d6c2c2)] hover:shadow-[0_28px_72px_rgba(23,22,26,0.2)] sm:min-h-[214px] sm:p-6 sm:shadow-[0_22px_60px_rgba(23,22,26,0.16)]"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--accent)]" aria-hidden />
                <div className="absolute right-4 top-4 text-[11px] font-bold tracking-[0.18em] text-[var(--palette-d6c7c7)]" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex items-start justify-between gap-4 pr-10">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[7px] border border-[var(--palette-eadede)] bg-[var(--palette-fbf7f7)] text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:size-12">
                    {renderTrustIcon(item.icon, index)}
                  </span>
                </div>
                <h3 className="mt-4 max-w-none pr-7 text-base font-semibold leading-tight text-[var(--text-primary)] [text-wrap:balance] sm:mt-6 sm:text-[17px]">{item.title}</h3>
                <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--palette-5e5a5b)] sm:mt-3 sm:text-sm sm:leading-6">{item.text}</p>
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
            <p className={`${content.baseSection.preview ? "mt-8 font-semibold text-[var(--text-primary)]" : "mt-5 text-[var(--palette-666164)]"} text-[17px] leading-7`}>
              {content.baseSection.subtitle}
            </p>
            {content.baseSection.badge ? (
              <p className="mt-6 flex w-full items-center gap-3 rounded-[8px] bg-[var(--accent)] px-4 py-3 text-[13px] font-semibold leading-5 text-white shadow-[0_14px_34px_rgba(138,21,21,0.22)] sm:inline-flex sm:w-auto sm:px-5 sm:text-sm">
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
                      className="group relative overflow-hidden rounded-[8px] border border-[var(--palette-e9e1df)] bg-white p-4 shadow-[0_12px_34px_rgba(23,22,26,0.05)]"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="grid size-8 place-items-center rounded-[6px] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Check className="size-4" aria-hidden />
                        </span>
                        <span className="text-[11px] font-bold text-[var(--palette-c8b9b9)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      {item.title ? <h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.title}</h3> : null}
                      <p className={`${item.title ? "mt-2" : ""} text-[13px] font-medium leading-6 text-[var(--palette-333)]`}>{item.text}</p>
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
            <div className="overflow-hidden rounded-[8px] border border-[var(--palette-e7ddda)] bg-[var(--palette-f7f4f2)] px-5 sm:px-7 lg:px-8">
              {content.baseSection.points.map((point, index) => {
                const item = normalizeBaseSectionPoint(point);

                return (
                  <article
                    key={`${item.title ?? "point"}-${item.text}`}
                    className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 border-b border-[var(--palette-ded3d0)] py-6 last:border-b-0 sm:grid-cols-[42px_44px_minmax(0,1fr)] sm:items-center sm:gap-x-5 sm:py-7"
                  >
                    <span className="pt-1 text-[12px] font-bold tracking-[0.14em] text-[var(--accent)] sm:pt-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="hidden size-11 place-items-center rounded-[7px] border border-[var(--palette-e2d7d4)] bg-white text-[var(--accent)] sm:grid">
                      {index === 0 ? <Home className="size-5" aria-hidden /> : null}
                      {index === 1 ? <Landmark className="size-5" aria-hidden /> : null}
                      {index === 2 ? <ShieldCheck className="size-5" aria-hidden /> : null}
                    </span>
                    <div>
                      {item.title ? <h3 className="text-[15px] font-semibold leading-6 text-[var(--palette-2f2c2d)] sm:text-base">{item.title}</h3> : null}
                      <p className={`${item.title ? "mt-1.5" : "font-semibold"} text-[14px] leading-6 text-[var(--palette-625d5f)] sm:text-[15px]`}>{item.text}</p>
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
          <div className="relative overflow-hidden rounded-[8px] border border-[var(--palette-eadede)] bg-[var(--palette-f5f3f1)] p-4 shadow-[0_18px_64px_rgba(23,22,26,0.08)] sm:p-6 lg:p-7">
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
                        className="grid min-h-[132px] grid-cols-[38px_minmax(0,1fr)] gap-4 rounded-[8px] border border-[var(--palette-e7ddda)] bg-white p-4 shadow-[0_10px_28px_rgba(23,22,26,0.045)]"
                      >
                        <span className="grid size-9 place-items-center rounded-[6px] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon className="size-[18px]" aria-hidden />
                        </span>
                        <p className="text-[13px] font-medium leading-6 text-[var(--palette-4f4b4c)]">{item}</p>
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

      {compact ? null : <LeadgenFinalQuizCta content={content} imageRenderer={ImageRenderer} requestButton={RequestButton} />}

      <LeadgenPromoFooter copyright={copyright} registry={registry} privacyModal={PrivacyModal} />
      <QuizModal content={content} />
      <SimpleRequestModal />
    </main>
  );
}

function CompactBenefitsSection({ content }: { content: LeadgenPromoContentDto }) {
  return (
    <section className="relative z-20 mx-auto w-full max-w-[1220px] px-5 py-12 sm:px-8 sm:py-16 lg:-mt-20 lg:pb-20 lg:pt-0">
      <div className="overflow-hidden rounded-[8px] border border-[var(--palette-e6dddd)] bg-white shadow-[0_24px_70px_rgba(23,22,26,0.13)]">
        <div className="grid bg-[var(--palette-f7f3f3)] px-6 py-7 sm:px-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-9">
          <div className="border-b border-[var(--palette-dfd2d2)] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Результат опроса</p>
            <h2 className="mt-3 text-[25px] font-semibold leading-[1.12] text-[var(--text-primary)] sm:text-[30px]">
              {content.afterRequestTitle}
            </h2>
          </div>
          <div className="grid lg:grid-cols-3">
            {content.trustItems.map((item, index) => (
              <article
                key={item.title}
                className="border-b border-[var(--palette-dfd2d2)] py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:px-7 lg:py-0 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-[8px] bg-white text-[var(--accent)] shadow-[0_8px_24px_rgba(138,21,21,0.08)]">
                    {renderTrustIcon(item.icon, index)}
                  </span>
                  <span className="text-[11px] font-bold tracking-[0.16em] text-[var(--palette-b9a7a7)]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-[17px] font-semibold leading-tight text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-3 text-[13px] font-medium leading-6 text-[var(--palette-615b5d)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="h-[3px] bg-[var(--accent)]" aria-hidden />
      </div>
    </section>
  );
}

function renderHeroTitle(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title;

  const [before, ...rest] = title.split(accent);

  return (
    <>
      {before}
      <span className="text-[var(--palette-f2c4c4)]">{accent}</span>
      {rest.join(accent)}
    </>
  );
}

function normalizeBaseSectionPoint(point: LeadgenPromoContentDto["baseSection"]["points"][number]) {
  return typeof point === "string" ? { title: null, text: point } : point;
}

function renderTrustIcon(icon: LeadgenPromoContentDto["trustItems"][number]["icon"], index: number) {
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
    <span className="shrink-0 rounded-[7px] bg-[var(--accent-soft)] px-3 py-2 text-right text-[var(--accent)]">
      <span className="block text-[18px] font-semibold leading-none">{value}</span>
      {description ? (
        <span className="mt-1 block max-w-[132px] text-[10.5px] font-medium leading-[1.25] text-[var(--palette-7a4b4b)]">
          {description}
        </span>
      ) : null}
    </span>
  );
}

function BaseSectionPreview({ content, imageRenderer: ImageRenderer }: { content: LeadgenPromoContentDto; imageRenderer: SiteImageRenderer }) {
  if (!content.baseSection.preview) {
    return null;
  }

  if (content.baseSection.preview.variant === "expert") {
    const image = content.baseSection.preview.image ?? content.manager.photo;

    return (
      <div className="relative">
        <div className="absolute inset-0 translate-y-6 rounded-[8px] bg-[var(--text-primary)]/10 blur-2xl" aria-hidden />
        <div className="relative overflow-hidden rounded-[8px] border border-[var(--palette-eadede)] bg-[var(--text-primary)] p-3 shadow-[0_26px_76px_rgba(23,22,26,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(138,21,21,0.24),rgba(23,22,26,0)_48%,rgba(255,255,255,0.08))]" aria-hidden />
          <div className="relative overflow-hidden rounded-[7px] border border-white/10 bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--palette-eee7e5)] p-4">
              <div className="min-w-0">
                <p className="text-[18px] font-semibold leading-tight text-[var(--text-primary)] sm:text-[20px]">
                  {content.baseSection.preview.label}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--palette-fbf8f8)] px-2.5 py-1.5 text-[12px] font-medium leading-none text-[var(--accent)]">
                  <MapPin className="size-3.5" aria-hidden />
                  {content.baseSection.preview.city}
                </p>
              </div>
              {renderExpertPreviewCount(content.baseSection.preview.countLabel)}
            </div>
            <div className="relative min-h-[410px] overflow-hidden bg-[var(--palette-f5f3f1)] sm:min-h-[520px] lg:min-h-[560px]">
              <ImageRenderer
                src={image}
                alt={`${content.manager.name}, ${content.manager.role}`}
                fill
                sizes="(max-width: 1024px) calc(100vw - 40px), 430px"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(23,22,26,0)_0%,rgba(23,22,26,0.82)_100%)] p-5 pt-24 text-white">
                <p className="text-[18px] font-semibold leading-tight">{content.manager.name}</p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-white/76">{content.manager.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 translate-y-6 rounded-[8px] bg-[var(--text-primary)]/10 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-[8px] border border-[var(--palette-eadede)] bg-[var(--text-primary)] p-3 shadow-[0_26px_76px_rgba(23,22,26,0.18)]">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(138,21,21,0.24),rgba(23,22,26,0)_48%,rgba(255,255,255,0.08))]" aria-hidden />
        <div className="relative rounded-[7px] border border-white/10 bg-white p-3">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--palette-eee7e5)] pb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{content.baseSection.preview.label}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{content.baseSection.preview.city}</p>
            </div>
            <span className="rounded-[6px] bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
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
                  className="grid grid-cols-[82px_minmax(0,1fr)] gap-3 rounded-[7px] border border-[var(--palette-eee7e5)] bg-[var(--palette-fbfbfa)] p-2"
                >
                  <ImageRenderer
                    src={apartment.image}
                    alt={`Квартира ID ${apartment.id}`}
                    width={164}
                    height={126}
                    unoptimized
                    sizes="82px"
                    className="h-[76px] w-[82px] rounded-[6px] object-cover"
                  />
                  <div className="min-w-0 py-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--palette-8f8b8c)]">ID {apartment.id}</p>
                    <p className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">{apartment.price}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rooms ? (
                        <span className="rounded-[5px] bg-white px-2 py-1 text-[11px] font-medium text-[var(--palette-555)] shadow-[inset_0_0_0_1px_var(--palette-e8e0de)]">
                          {rooms}
                        </span>
                      ) : null}
                      {area ? (
                        <span className="rounded-[5px] bg-white px-2 py-1 text-[11px] font-medium text-[var(--palette-555)] shadow-[inset_0_0_0_1px_var(--palette-e8e0de)]">
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

function LeadgenFinalQuizCta({ content, imageRenderer: ImageRenderer, requestButton: RequestButton }: { content: LeadgenPromoContentDto; imageRenderer: SiteImageRenderer; requestButton: ElementType }) {
  if (content.hideFinalCta) {
    return null;
  }

  if (content.finalCta) {
    const constructionPreview = content.constructionExamples?.slice(0, 3) ?? [];
    const hasConstructionPreview = constructionPreview.length > 0;
    const hasPreviewRows = hasConstructionPreview;
    const showsExpertPortrait = content.finalCta.image === content.manager.photo;

    return (
      <section id="final-cta" className="scroll-mt-28 bg-[var(--palette-fbf8f8)] px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
        <div className={`mx-auto grid w-full max-w-[1160px] overflow-hidden rounded-[8px] border border-[var(--palette-eadede)] bg-[var(--palette-f4f1f1)] shadow-[0_24px_70px_rgba(23,22,26,0.08)] ${showsExpertPortrait ? "lg:grid-cols-[minmax(360px,0.82fr)_minmax(500px,1.18fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)]"}`}>
          <div className={`relative overflow-hidden ${showsExpertPortrait ? "aspect-[4/5] min-h-0 bg-[radial-gradient(circle_at_50%_28%,var(--palette-f7eeee)_0%,var(--palette-e5dcda)_72%,var(--palette-d8cfcc)_100%)] sm:aspect-auto sm:min-h-[380px] lg:min-h-[480px]" : "min-h-[280px] bg-[var(--palette-e8e6e3)] sm:min-h-[380px] lg:min-h-[480px]"}`}>
            <ImageRenderer
              src={content.finalCta.image}
              alt={content.finalCta.imageAlt}
              fill
              sizes="(max-width: 1024px) calc(100vw - 40px), 620px"
              className={showsExpertPortrait ? "object-cover object-center sm:object-contain sm:object-bottom sm:px-8 sm:pt-8" : "object-cover object-center"}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,22,26,0)_44%,rgba(23,22,26,0.16)_100%)]" aria-hidden />
            {showsExpertPortrait ? (
              <div className="absolute bottom-4 left-4 rounded-[8px] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_14px_38px_rgba(23,22,26,0.14)] backdrop-blur-sm sm:bottom-6 sm:left-6">
                <p className="text-[13px] font-semibold leading-tight text-[var(--text-primary)]">{content.manager.name}</p>
                <p className="mt-1 text-[11px] font-medium text-[var(--palette-746f70)]">{content.manager.role}</p>
              </div>
            ) : null}
            {hasPreviewRows ? (
              <div className="absolute bottom-5 left-5 w-[245px] max-w-[calc(100%-40px)] rounded-[16px] border-[5px] border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[0_22px_46px_rgba(23,22,26,0.28)] sm:bottom-7 sm:left-7 sm:w-[292px]">
              <div className="rounded-[11px] bg-white p-3">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2.5">
                  <div>
                    <p className="text-[11px] font-semibold leading-none text-[var(--accent)]">
                      {hasConstructionPreview ? "Расчет строительства" : "Подборка новостроек"}
                    </p>
                    <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--text-muted)]">
                      {hasConstructionPreview ? "Краснодар · каталог проектов" : "Краснодар · расчет ипотеки"}
                    </p>
                  </div>
                  <span className="rounded-[5px] bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold leading-none text-[var(--accent)]">
                    {hasConstructionPreview ? "смета" : "по актуальным условиям"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {constructionPreview.map((project) => (
                        <div
                          key={project.id}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[7px] border border-[var(--palette-eee7e5)] bg-[var(--palette-fbfbfa)] px-2.5 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold leading-4 text-[var(--text-primary)]">{project.material}</p>
                            <p className="mt-0.5 truncate text-[9px] font-medium leading-3 text-[var(--text-muted)]">{project.area} · {project.buildTime}</p>
                          </div>
                          <p className="text-right text-[10px] font-semibold leading-3 text-[var(--accent)]">{project.priceFrom}</p>
                        </div>
                      ))}
                </div>
                <div className="mt-3 rounded-[6px] bg-[var(--text-primary)] px-3 py-2 text-center text-[10px] font-semibold leading-none text-white">
                  {hasConstructionPreview ? "каталог и расчет в мессенджер" : "3-5 вариантов в мессенджер"}
                </div>
              </div>
              </div>
            ) : null}
          </div>

          <div className="grid content-center bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className={showsExpertPortrait ? "max-w-[580px]" : "max-w-[520px]"}>
              <h2 className={`text-[24px] font-semibold leading-[1.18] text-[var(--text-primary)] min-[420px]:text-[26px] sm:text-[31px] ${showsExpertPortrait ? "lg:text-[31px]" : "lg:text-[34px]"}`}>
                {content.finalCta.title}
              </h2>
              {content.finalCta.bullets.length ? (
                <ul className="mt-7 grid gap-4 text-[14px] font-medium leading-6 text-[var(--text-secondary)] sm:text-[15px]">
                  {content.finalCta.bullets.map((bullet) => {
                    const Icon = bullet.icon === "clock" ? Clock3 : Check;

                    return (
                      <li key={bullet.text} className="grid grid-cols-[26px_minmax(0,1fr)] gap-3">
                        <span className="mt-0.5 grid size-6 place-items-center rounded-[6px] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <span>{bullet.text}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <div className="mt-8 w-full max-w-[440px]">
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
                <p className="mx-auto mt-3 px-2 text-center text-[12px] font-medium leading-5 text-[var(--text-muted)]">
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
    <section id="final-cta" className="mx-auto w-full max-w-[1160px] scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20">
      <div className="overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--palette-f3f4f4)] shadow-[0_24px_70px_rgba(23,22,26,0.08)] lg:grid lg:min-h-[430px] lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
        <div className="relative min-h-[260px] overflow-hidden bg-[var(--palette-e8e6e3)] sm:min-h-[330px] lg:min-h-[430px]">
          <ImageRenderer
            src={leadgenHeroImage}
            alt="Квартира из закрытой базы агентства недвижимости"
            fill
            sizes="(max-width: 1024px) calc(100vw - 40px), 560px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.18),rgba(0,0,0,0.03)_46%,rgba(255,255,255,0.2))]" aria-hidden />
          <div className="absolute bottom-[-34px] right-[-6px] h-[218px] w-[118px] rotate-[-8deg] rounded-b-[28px] rounded-t-full bg-[var(--palette-efc29f)] shadow-[0_20px_48px_rgba(96,54,28,0.22)] sm:right-[-16px]" aria-hidden />
          <div className="absolute bottom-7 right-5 w-[174px] rotate-[-3deg] rounded-[28px] border-[6px] border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[0_24px_55px_rgba(0,0,0,0.28)] min-[420px]:right-8 min-[420px]:w-[194px] sm:right-12 lg:right-10 lg:w-[210px]">
            <div className="relative overflow-hidden rounded-[22px] bg-white p-2">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--text-primary)]/15" aria-hidden />
              <div className="rounded-[7px] bg-[var(--accent)] px-2 py-1 text-center text-[8px] font-semibold leading-3 text-white">
                Подборка агентства недвижимости
              </div>
              <div className="mt-2 grid gap-2">
                {previewApartments.map((apartment) => {
                  const rooms = apartment.facts.find(([label]) => label === "Количество комнат")?.[1] ?? "квартира";
                  const area = apartment.facts.find(([label]) => label === "Общая площадь")?.[1];

                  return (
                    <article
                      key={apartment.id}
                      className="grid grid-cols-[46px_minmax(0,1fr)] gap-2 rounded-[6px] border border-[var(--palette-ecebea)] bg-[var(--surface-card-soft)] p-1.5"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[5px] bg-[var(--palette-ebe9e6)]">
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
                        <p className="truncate text-[8px] font-semibold leading-3 text-[var(--text-primary)]">
                          {rooms}
                          {area ? `, ${area} м²` : ""}
                        </p>
                        <p className="mt-0.5 truncate text-[8px] font-bold leading-3 text-[var(--accent)]">{apartment.price}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-2 rounded-[6px] bg-[var(--accent-soft)] px-2 py-1.5 text-center text-[8px] font-semibold leading-3 text-[var(--accent)]">
                5-10 вариантов в мессенджер
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-center px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <h2 className="text-[24px] font-semibold leading-[1.16] text-[var(--palette-111)] min-[420px]:text-[27px] sm:text-[32px] lg:text-[34px]">
            Пройдите тест за одну минуту и получите подборку квартир из{" "}
            <span className="text-[var(--accent)]">закрытой базы</span> по Вашим параметрам
          </h2>
          <ul className="mt-8 grid gap-5 text-sm font-medium leading-6 text-[var(--palette-333)] sm:text-[15px]">
            <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 grid size-[18px] place-items-center rounded-[4px] bg-[var(--accent)] text-white">
                <Check className="size-3.5" aria-hidden />
              </span>
              <span>Это бесплатно и ни к чему Вас не обязывает</span>
            </li>
            <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 grid size-[18px] place-items-center rounded-[4px] bg-[var(--accent)] text-white">
                <Check className="size-3.5" aria-hidden />
              </span>
              <span>Подборку с актуальными ценами и фотографиями отправим в удобный мессенджер в течение 10 минут</span>
            </li>
          </ul>
          <div className="mt-8">
            <RequestButton
              className={`${primaryButtonClass} sm:w-[330px]`}
              mode="quiz"
              title="Бесплатный подбор проверенных квартир в Краснодаре"
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

function LeadgenPromoFooter({ copyright, registry, privacyModal: PrivacyModal }: { copyright: string; registry: string; privacyModal: ElementType }) {
  return (
    <footer id="leadgen-footer" className="bg-[var(--palette-111111)] text-white">
      <div className="mx-auto w-full max-w-[1160px] px-5 py-8 sm:px-8 sm:py-9">
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
