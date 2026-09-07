import type { JournalCategoryPageDto } from "@starter/site-contracts";
import { ChevronLeft, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../components/ui/badge";
import { RequestModalButton } from "../components/shared/site-overlay-context";
import { Card } from "../components/ui/card";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";
import { JournalArticleCard, JournalArticleImage, JournalBreadcrumbs, JournalSectionHeader } from "./journal-shared";

export function JournalCategoryView({ page, linkRenderer: LinkRenderer, imageRenderer, renderOfferCard }: {
  page: JournalCategoryPageDto;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
  renderOfferCard: (index: number) => ReactNode;
}) {
  return <main className="bg-[var(--background)] px-5 pb-24 pt-6 text-[var(--text-primary)] md:pb-32 md:pt-8">
    <Card className="mx-auto max-w-site-frame border-0 p-5 md:p-7 lg:p-8">
      <LinkRenderer href="/journal" className="inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"><ChevronLeft className="size-4" aria-hidden />Назад к журналу</LinkRenderer>
      <JournalBreadcrumbs className="mt-3" items={[{ label: "Главная", href: "/" }, { label: "Журнал агентства", href: "/journal" }, { label: page.category.title }]} linkRenderer={LinkRenderer} />
      <header className="mt-5 max-w-[920px]"><h1 className="text-[30px] font-semibold leading-tight md:text-[38px]">{page.h1}</h1><p className="mt-4 max-w-[760px] text-sm leading-6 text-[var(--text-secondary)] md:text-base md:leading-7">{page.lead}</p></header>
      <nav className="mt-6 flex gap-2 overflow-x-auto" aria-label="Рубрики журнала">{page.categories.map((item) => <Badge key={item.slug} asChild variant={item.active ? "default" : "secondary"} className={`rounded-lg border-0 px-3 py-2 ${item.active ? "bg-[var(--text-primary)] text-white" : "bg-[var(--journal-surface)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"}`}><LinkRenderer href={item.href}>{item.title}</LinkRenderer></Badge>)}</nav>
      <section className="mt-10 md:mt-12" aria-labelledby="rubric-primary-title"><h2 id="rubric-primary-title" className="sr-only">Главные материалы рубрики</h2><div className="grid gap-6 md:grid-cols-3">{page.primaryArticles.map((article) => <JournalArticleCard key={article.id} article={article} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} />)}</div></section>
      {page.offer ? <section className="mt-12 md:mt-14 lg:mt-16" aria-labelledby="rubric-offer-title"><JournalSectionHeader id="rubric-offer-title" title="Вас может заинтересовать" action={page.offer.action} linkRenderer={LinkRenderer} /><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{page.offer.title}</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{page.offer.items.map((_, index) => renderOfferCard(index))}</div></section> : null}
      {page.featuredArticle ? <section className="mt-12 md:mt-14 lg:mt-16" aria-labelledby="rubric-featured-title"><JournalArticleImage article={page.featuredArticle} className="aspect-[16/7.2]" titleClassName="text-[18px]" sizes="(min-width: 1280px) 1280px, 100vw" linkRenderer={LinkRenderer} imageRenderer={imageRenderer} /></section> : null}
      <section className="mt-12 rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-5 md:mt-14 md:p-6 lg:mt-16" aria-labelledby="rubric-consult-title"><div className="grid gap-5 md:grid-cols-[64px_minmax(0,1fr)_auto] md:items-center"><span className="grid size-14 place-items-center rounded-lg bg-white text-[var(--accent)] shadow-[var(--shadow-card)]"><MessageCircle className="size-6" aria-hidden /></span><div className="min-w-0"><h2 id="rubric-consult-title" className="text-[21px] font-semibold leading-tight">{page.consultation.title}</h2><p className="mt-2 max-w-[760px] text-sm leading-6 text-[var(--text-secondary)]">{page.consultation.text}</p></div><RequestModalButton type="button" request={{ title: page.consultation.modalTitle, subtitle: page.consultation.modalSubtitle, showSubtitle: true, source: page.consultation.source, formType: "journal_request", submitLabel: page.consultation.buttonLabel }}>{page.consultation.buttonLabel}</RequestModalButton></div></section>
      {page.moreArticles.length ? <section className="mt-12 md:mt-14 lg:mt-16" aria-labelledby="rubric-more-title"><h2 id="rubric-more-title" className="text-[23px] font-semibold leading-tight">Ещё материалы журнала</h2><div className="mt-5 grid gap-x-6 gap-y-8 md:grid-cols-3">{page.moreArticles.map((article) => <JournalArticleCard key={article.id} article={article} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} />)}</div></section> : null}
    </Card>
  </main>;
}
