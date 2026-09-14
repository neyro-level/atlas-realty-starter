import type { JournalHubPageDto } from "@starter/site-contracts";
import "../../styles/journal.css";
import { Building2, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../../components/ui/badge";
import { RequestModalButton } from "../../components/shared/site-overlay-context";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import type { SiteImageRenderer, SiteLinkRenderer } from "../../lib/adapters";
import { JournalArticleCard, JournalArticleImage, JournalBreadcrumbs, JournalSectionHeader } from "../journal/journal-shared";

export function JournalHubView({ page, cityPrepositional, linkRenderer: LinkRenderer, imageRenderer, renderNewBuildingCard }: {
  page: JournalHubPageDto;
  cityPrepositional: string;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
  renderNewBuildingCard: (index: number) => ReactNode;
}) {
  const ImageRenderer = imageRenderer;
  return (
    <main className="bg-[var(--background)] px-5 pb-24 pt-6 text-[var(--text-primary)] md:pb-32 md:pt-8">
      <div className="mx-auto max-w-site-frame grid gap-8 md:gap-10 lg:gap-12">
        <JournalBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Журнал агентства" }]} linkRenderer={LinkRenderer} />
        <Card className="border-0 p-5 md:p-6" aria-labelledby="journal-title">
          <div className="grid gap-4 lg:grid-cols-[max-content_minmax(0,1fr)] lg:items-center">
            <h1 id="journal-title" className="whitespace-nowrap text-editorial-title font-semibold leading-editorial-title">Журнал агентства</h1>
            <form action="/journal" className="relative w-full" role="search">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
              <Input type="search" name="q" defaultValue={page.query} placeholder="Что вас интересует?" className="h-12 w-full rounded-lg border-[var(--border)] bg-[var(--journal-surface)] pl-11 pr-4 text-body font-medium focus:bg-[var(--surface-card)]" />
            </form>
          </div>
          <nav className="mt-5 flex w-full max-w-full gap-2 overflow-x-auto" aria-label="Рубрики журнала">
            <Badge asChild className="rounded-lg border-0 bg-[var(--text-primary)] px-3 py-2 text-white"><LinkRenderer href="/journal">Все материалы</LinkRenderer></Badge>
            {page.categories.map((category) => <Badge key={category.slug} asChild variant="secondary" className="rounded-lg border-0 bg-[var(--journal-surface)] px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"><LinkRenderer href={category.href}>{category.title}</LinkRenderer></Badge>)}
          </nav>
        </Card>

        {page.query ? <JournalGridSection section={page.sections[0]!} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} /> : <>
          {page.popular.length ? <Card className="border-0 p-5 md:p-6" aria-labelledby="journal-popular-title">
            <JournalSectionHeader id="journal-popular-title" title="Популярное сейчас" action={{ href: "/journal", label: "Посмотреть все" }} linkRenderer={LinkRenderer} />
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
              <JournalArticleImage article={page.popular[0]!} className="aspect-[16/8.7]" sizes="(min-width: 1280px) 520px, (min-width: 768px) 50vw, 100vw" priority showExcerpt={false} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} />
              <div className="grid content-start gap-3">{page.popular.slice(1, 5).map((article) => <LinkRenderer key={article.id} href={article.href} className="group grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-lg p-1 transition hover:bg-[var(--surface-card-soft)]"><span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-[var(--surface-muted)]"><ImageRenderer src={article.image} alt="" fill unoptimized={article.image.startsWith("http") || article.image.startsWith("/")} sizes="96px" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></span><span className="min-w-0 self-center"><span className="line-clamp-2 text-body font-semibold leading-step-body transition group-hover:text-[var(--accent)]">{article.title}</span><span className="mt-1.5 block text-caption leading-step-small text-[var(--text-muted)]">{article.dateLabel} · {article.topicLabel}</span></span></LinkRenderer>)}</div>
            </div>
          </Card> : null}
          {page.sections[0] ? <JournalGridSection section={page.sections[0]} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} /> : null}
          <Card className="border-0 p-5 md:p-7" aria-labelledby="journal-new-buildings-title">
            <JournalSectionHeader id="journal-new-buildings-title" title="Новостройки" action={{ href: "/novostroyki", label: "Открыть каталог" }} linkRenderer={LinkRenderer} />
            <div className="mt-6 grid gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))_280px]">{page.newBuildings.map((_, index) => renderNewBuildingCard(index))}<div className="flex min-h-67 flex-col rounded-lg bg-[var(--journal-surface-blue)] p-5"><span className="grid size-10 place-items-center rounded-lg bg-[var(--surface-card)] text-[var(--accent)]"><Building2 className="size-5" aria-hidden /></span><h3 className="mt-4 text-heading-small font-semibold leading-tight-copy">Поможем выбрать новостройку в {cityPrepositional}</h3><p className="mt-3 text-support leading-support text-[var(--text-secondary)]">Сравним условия всех застройщиков и найдём для вас акции, о которых не пишут в рекламе.</p><RequestModalButton type="button" request={{ title: `Поможем выбрать новостройку в ${cityPrepositional}`, subtitle: "Сравним условия всех застройщиков и найдём для вас акции, о которых не пишут в рекламе.", showSubtitle: true, source: "journal:index:new-buildings", formType: "new_building_selection", submitLabel: "Получить подборку" }} className="mt-auto">Получить подборку</RequestModalButton></div></div>
          </Card>
          {page.sections[1] ? <JournalGridSection section={page.sections[1]} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} /> : null}
          <Card className="border-0 p-5 md:p-6" aria-labelledby="journal-interest-title"><JournalSectionHeader id="journal-interest-title" title="Вас может заинтересовать" action={{ href: "/nedvizhimost", label: "В каталог" }} linkRenderer={LinkRenderer} /><div className="mt-4 flex flex-wrap gap-2">{page.interests.map((item) => <Badge key={item.href} asChild variant="secondary" className="rounded-lg border-0 px-3 py-2"><LinkRenderer href={item.href}>{item.label}</LinkRenderer></Badge>)}</div></Card>
          {page.sections[2] ? <JournalGridSection section={page.sections[2]} linkRenderer={LinkRenderer} imageRenderer={imageRenderer} /> : null}
        </>}
      </div>
    </main>
  );
}

function JournalGridSection({ section, linkRenderer, imageRenderer }: { section: JournalHubPageDto["sections"][number]; linkRenderer: SiteLinkRenderer; imageRenderer: SiteImageRenderer }) {
  return <Card className="border-0 p-5 md:p-6" aria-labelledby={section.id}><JournalSectionHeader id={section.id} title={section.title} action={section.action} linkRenderer={linkRenderer} />{section.articles.length ? <div className="mt-5 grid gap-5 md:grid-cols-3">{section.articles.map((article) => <JournalArticleCard key={article.id} article={article} linkRenderer={linkRenderer} imageRenderer={imageRenderer} />)}</div> : <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-5 text-body leading-step-copy text-[var(--text-secondary)]">{section.emptyText ?? "Материалы для этой секции появятся после публикации."}</div>}</Card>;
}
