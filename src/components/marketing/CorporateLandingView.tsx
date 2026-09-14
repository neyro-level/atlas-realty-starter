import { Building2, Calculator, ShieldCheck } from "lucide-react";
import type { CorporateHeroIconKeyDto, CorporateLandingPageDto } from "@starter/site-contracts";
import type { ReactNode } from "react";
import type { SiteImageRenderer, SiteLinkRenderer } from "@starter/site-ui/contracts";
import { Card } from "@starter/site-ui/primitives";
import { CorporateRelatedArticlesView, CorporateRelatedServicesView } from "@starter/site-ui/views";

type Props = {
  page: CorporateLandingPageDto;
  breadcrumbs: ReactNode;
  catalogHero: ReactNode;
  primaryAction: ReactNode;
  bodyBeforeRelated: ReactNode;
  secondaryBreadcrumbs: ReactNode;
  bodyAfterRelated: ReactNode;
  showcase: ReactNode;
  afterShowcase: ReactNode;
  footerContent: ReactNode;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
};

const ICONS = { building: Building2, calculation: Calculator, protection: ShieldCheck } as const;
const DEFAULT_ORDER: CorporateHeroIconKeyDto[] = ["building", "calculation", "protection"];

export function CorporateLandingView({ page, breadcrumbs, catalogHero, primaryAction, bodyBeforeRelated, secondaryBreadcrumbs, bodyAfterRelated, showcase, afterShowcase, footerContent, linkRenderer, imageRenderer: ImageRenderer }: Props) {
  return (
    <main className="min-h-screen bg-[var(--surface-card)] text-[var(--text-primary)]">
      {page.hasSecondaryCatalogIntro ? null : (
        <section className="bg-[var(--surface-card)]"><div className="mx-auto max-w-site-frame px-5 pb-3 pt-6 lg:py-8"><div className="mb-4">{breadcrumbs}</div>{page.usesCatalogHero ? catalogHero : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
            <div className="relative min-h-115 overflow-hidden rounded-xl bg-[var(--surface-dark)] text-white shadow-[var(--corporate-landing-shadow-primary)]">
              <ImageRenderer src={page.genericHeroImage} alt="" fill priority sizes="(max-width: 1280px) 100vw, 860px" className="object-cover" />
              <div className="absolute inset-0 bg-[var(--surface-dark-strong)]/72" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-6 md:p-8 lg:p-10"><div className="max-w-3xl"><p className="text-caption font-extrabold uppercase tracking-overline text-white/74">{page.eyebrow}</p><h1 className="mt-5 text-page-title font-extrabold leading-page-title text-white">{page.heroTitle}</h1><p className="mt-5 max-w-2xl text-body-large leading-body text-white/78">{page.heroDescription}</p></div><div className="flex flex-col gap-4">{primaryAction}<p className="max-w-2xl text-body leading-body text-white/66">{page.microtext}</p></div></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">{page.heroCards.map((card, index) => { const Icon = ICONS[card.icon ?? DEFAULT_ORDER[index % DEFAULT_ORDER.length]!]; return <Card key={card.title} className="rounded-lg border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-none transition hover:shadow-[var(--corporate-landing-shadow-secondary)]"><div className="flex size-11 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-caption font-extrabold uppercase tracking-overline text-[var(--accent)]"><Icon className="size-5" aria-hidden /></div><h2 className="mt-5 text-body-emphasis font-extrabold leading-card text-[var(--text-primary)]">{card.title}</h2><p className="mt-3 text-body leading-body text-[var(--text-secondary)]">{card.text}</p></Card>; })}</div>
          </div>
        )}</div></section>
      )}
      {bodyBeforeRelated}
      <CorporateRelatedServicesView links={page.relatedServices} linkRenderer={linkRenderer} />
      <CorporateRelatedArticlesView articles={page.relatedArticles} linkRenderer={linkRenderer} />
      {page.hasSecondaryCatalogIntro ? <section className="bg-[var(--surface-card)] pt-6"><div className="mx-auto max-w-site-frame px-5">{secondaryBreadcrumbs}</div></section> : null}
      {bodyAfterRelated}
      {showcase}
      {afterShowcase}
      {footerContent}
    </main>
  );
}
