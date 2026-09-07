import type { LegalDocumentDto } from "@starter/site-contracts";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { Card } from "../components/ui/card";
import type { SiteLinkRenderer } from "../lib/adapters";

type LegalHubViewProps = {
  documents: readonly LegalDocumentDto[];
  linkRenderer: SiteLinkRenderer;
};

export function LegalHubView({ documents, linkRenderer: LinkRenderer }: LegalHubViewProps) {
  return (
    <main className="min-h-[calc(100vh-106px)] bg-[var(--legal-hub-surface-01)] px-4 py-8 text-[var(--legal-hub-content-01)] sm:px-6 md:py-14 lg:py-16">
      <Card className="mx-auto max-w-[1140px] overflow-hidden rounded-lg border-[var(--legal-hub-border-01)] bg-white px-5 py-7 shadow-[var(--legal-hub-shadow-01)] sm:px-7 sm:py-9 md:px-10 md:py-11">
        <Breadcrumb className="mb-5 text-[var(--text-muted)]">
          <BreadcrumbList className="flex-nowrap gap-x-2 overflow-x-auto py-0.5 text-sm leading-5">
            <BreadcrumbItem><BreadcrumbLink asChild className="shrink-0 whitespace-nowrap font-medium leading-5 transition hover:text-[var(--accent)]"><LinkRenderer href="/">Главная</LinkRenderer></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator className="size-3.5 shrink-0 self-center text-[var(--legal-hub-content-02)]" />
            <BreadcrumbItem><BreadcrumbPage className="min-w-0 truncate font-semibold leading-5 text-[var(--text-primary)]">Правовая информация</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-[28px] font-semibold leading-tight text-[var(--legal-hub-content-03)] md:text-[36px]">Правовая информация</h1>

        <Accordion type="multiple" className="mt-8 border-t border-[var(--legal-hub-border-02)] md:mt-10">
          {documents.map((document) => (
            <AccordionItem key={document.id} value={document.slug} className="group border-[var(--legal-hub-border-02)]">
              <AccordionTrigger
                className="min-h-[72px] py-5 text-[15px] font-medium leading-6 text-[var(--legal-hub-content-04)] hover:text-[var(--legal-hub-content-04)] md:min-h-[82px] md:py-6 md:text-base"
                trailing={<span className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--legal-hub-content-05)] transition group-hover:bg-[var(--legal-hub-surface-02)] group-hover:text-[var(--accent)]"><ChevronDown className="size-[18px] transition duration-200 group-data-[state=open]/accordion:rotate-180" aria-hidden /></span>}
              >
                {document.shortTitle}
              </AccordionTrigger>
              <AccordionContent forceMount className="pb-7 pr-0 md:pb-8 md:pr-16">
                <p className="max-w-[760px] text-sm font-normal leading-6 text-[var(--legal-hub-content-06)] md:text-[15px]">{document.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <LinkRenderer href={`/${document.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--legal-hub-surface-03)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--legal-hub-surface-04)]">
                    Открыть документ
                    <ArrowUpRight className="size-4" aria-hidden />
                  </LinkRenderer>
                  <span className="text-xs font-normal text-[var(--legal-hub-content-07)]">Редакция от {document.updatedAt}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </main>
  );
}