import type { LegalDocumentDto } from "@starter/site-contracts";
import { CalendarDays, Mail } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import type { SiteLinkRenderer } from "../lib/adapters";

type LegalDocumentViewProps = {
  document: LegalDocumentDto;
  legalName: string;
  email: string;
  linkRenderer: SiteLinkRenderer;
};

export function LegalDocumentView({ document, legalName, email, linkRenderer: LinkRenderer }: LegalDocumentViewProps) {
  return (
    <main className="bg-[var(--legal-document-surface-primary)] text-[var(--legal-document-content-primary)]">
      <header className="border-b border-[var(--legal-document-border-primary)] bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8 md:py-10">
          <Breadcrumb className="text-[var(--text-muted)]">
            <BreadcrumbList className="flex-nowrap gap-x-2 overflow-x-auto py-0.5 text-sm leading-5">
              <BreadcrumbItem><BreadcrumbLink asChild className="shrink-0 whitespace-nowrap font-medium leading-5 transition hover:text-[var(--accent)]"><LinkRenderer href="/">Главная</LinkRenderer></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="size-3.5 shrink-0 self-center text-[var(--legal-document-content-secondary)]" />
              <BreadcrumbItem><BreadcrumbLink asChild className="shrink-0 whitespace-nowrap font-medium leading-5 transition hover:text-[var(--accent)]"><LinkRenderer href="/legal">Правовая информация</LinkRenderer></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="size-3.5 shrink-0 self-center text-[var(--legal-document-content-secondary)]" />
              <BreadcrumbItem><BreadcrumbPage className="min-w-0 truncate font-semibold leading-5 text-[var(--text-primary)]">{document.shortTitle}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-5 max-w-[900px] text-[30px] font-extrabold leading-[1.12] text-[var(--text-primary)] md:text-[38px]">{document.title}</h1>
          <p className="mt-4 max-w-[760px] text-[15px] leading-6 text-[var(--legal-document-content-tertiary)] md:text-base md:leading-7">{document.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[var(--legal-document-content-subtle)]">
            <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" aria-hidden />Редакция от {document.updatedAt}</span>
            <span>Версия {document.version}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-6 px-5 py-8 md:px-8 md:py-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
        <Card className="rounded-lg border-[var(--legal-document-border-primary)] bg-white p-4 lg:sticky lg:top-[126px]" aria-label="Содержание документа">
          <p className="px-2 pb-3 text-xs font-extrabold uppercase text-[var(--legal-document-content-muted)]">Содержание</p>
          <nav className="space-y-1">
            {document.sections.map((section, index) => <a key={section.title} href={`#section-${index + 1}`} className="block rounded-md px-2 py-2 text-sm leading-5 text-[var(--legal-document-content-strong)] transition hover:bg-[var(--legal-document-surface-primary)] hover:text-[var(--accent)]">{section.title}</a>)}
          </nav>
        </Card>

        <Card className="overflow-hidden rounded-lg border-[var(--legal-document-border-primary)] bg-white px-5 md:px-8">
          {document.sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.title} className="scroll-mt-32 pt-7 last:pb-7 md:pt-9 md:last:pb-9">
              <h2 className="text-xl font-extrabold leading-tight text-[var(--legal-document-content-inverse)] md:text-2xl">{section.title}</h2>
              {section.paragraphs?.length ? <div className="mt-4 space-y-3 text-[15px] leading-[1.65] text-[var(--legal-document-content-strong)] md:text-base">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : null}
              {section.items?.length ? <ul className="mt-4 space-y-2.5 text-[15px] leading-[1.6] text-[var(--legal-document-content-strong)] md:text-base">{section.items.map((item) => <li key={item} className="grid grid-cols-[8px_minmax(0,1fr)] gap-3"><span className="mt-[9px] size-1.5 rounded-full bg-[var(--accent)]" aria-hidden /><span>{item}</span></li>)}</ul> : null}
              {index < document.sections.length - 1 ? <Separator className="mt-7 bg-[var(--legal-document-surface-secondary)] md:mt-9" /> : null}
            </section>
          ))}
        </Card>
      </div>

      <section className="border-t border-[var(--legal-document-border-primary)] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-7 text-sm text-[var(--legal-document-content-hover)] md:flex-row md:items-center md:justify-between md:px-8">
          <p>{legalName}</p>
          <Button asChild variant="link" className="min-h-11 gap-2 px-0"><a href={`mailto:${email}`}><Mail aria-hidden />{email}</a></Button>
        </div>
      </section>
    </main>
  );
}