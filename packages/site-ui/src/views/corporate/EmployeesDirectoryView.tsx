import { Search, UsersRound } from "lucide-react";
import type { EmployeeDirectoryPageDto } from "@starter/site-contracts";
import type { ReactNode } from "react";
import type { SiteLinkRenderer } from "../../lib/adapters";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type Props = { page: EmployeeDirectoryPageDto; breadcrumbs: ReactNode; hero: ReactNode; employeeCards: ReactNode[]; linkRenderer: SiteLinkRenderer };

export function EmployeesDirectoryView({ page, breadcrumbs, hero, employeeCards, linkRenderer: LinkRenderer }: Props) {
  return (
    <main className="min-h-screen bg-[var(--surface-card)] text-[var(--text-primary)]">
      <section className="bg-[var(--surface-card)]"><div className="mx-auto max-w-site-frame px-4 py-5 sm:px-5 sm:py-6 lg:py-8"><div className="mb-3 sm:mb-4">{breadcrumbs}</div>{hero}</div></section>
      <section className="mx-auto max-w-site-frame px-4 pb-16 sm:px-5 sm:pb-20 md:px-8 md:pb-24 lg:px-10 lg:pb-28">
        <nav aria-label="Разделы команды" className="mb-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-1.5 sm:mb-5 sm:p-2">
          <div className="flex min-w-max gap-1.5 sm:min-w-0 sm:grid sm:grid-cols-3 sm:gap-2">
            {page.tabs.map((tab) => <LinkRenderer key={tab.value} href={tab.href} ariaCurrent={tab.active ? "page" : undefined} className={`flex min-h-12 items-center justify-between gap-4 rounded-lg border px-4 text-body font-semibold transition sm:px-5 ${tab.active ? "border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white shadow-sm" : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)]"}`}><span>{tab.label}</span><span className={`text-label tabular-nums ${tab.active ? "text-white/70" : "text-[var(--text-muted)]"}`}>{tab.count}</span></LinkRenderer>)}
          </div>
        </nav>
        <Card className="grid gap-4 rounded-lg border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-none sm:gap-5 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.78fr)] md:items-center md:px-6 md:py-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:px-7">
          <div className="min-w-0"><h2 className="text-lead font-semibold leading-tight-copy sm:text-heading-small md:text-heading-compact">{page.activeTab.label}</h2><p className="mt-1 text-body text-[var(--text-secondary)]">{page.activeTab.description}</p></div>
          <label className="flex min-h-12 items-center gap-3 rounded-lg bg-[var(--background)] px-4"><Search className="size-5 shrink-0 text-[var(--text-muted)]" aria-hidden /><span className="sr-only">Поиск по имени</span><Input variant="plain" name="q" type="search" defaultValue={page.query} placeholder="Поиск по имени" enterKeyHint="search" autoComplete="name" className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-body shadow-none outline-none focus-visible:ring-0" /><Input variant="plain" type="hidden" name="team" value={page.tabs.find((tab) => tab.active)?.value ?? "sales"} /></label>
        </Card>
        {page.total === 0 ? <div className="mt-5 flex min-h-60 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-card)] px-5 py-10 text-center sm:mt-6 sm:min-h-70 sm:px-6"><UsersRound className="size-8 text-[var(--accent)]" aria-hidden /><h2 className="mt-4 text-lead font-semibold sm:text-heading-small">Специалисты не найдены</h2><p className="mt-2 max-w-md text-body leading-step-copy text-[var(--text-secondary)]">{page.query ? "Измените запрос поиска или очистите поле имени." : "Сейчас нет опубликованных сотрудников."}</p></div> : <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 lg:mt-7 lg:grid-cols-4">{employeeCards}</div>}
        {page.pageLinks.length > 1 ? <nav className="mt-12 flex flex-wrap justify-center gap-2 sm:mt-16 md:mt-20" aria-label="Страницы сотрудников">{page.pageLinks.map((item) => <LinkRenderer key={item.href} href={item.href} ariaCurrent={item.current ? "page" : undefined} className={`flex size-10 items-center justify-center rounded-lg border text-body font-medium ${item.current ? "border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white" : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)]"}`}>{item.label}</LinkRenderer>)}</nav> : null}
      </section>
    </main>
  );
}
