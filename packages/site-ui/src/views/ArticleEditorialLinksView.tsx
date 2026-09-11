import type { JournalLinkDto } from "@starter/site-contracts";
import { ArrowUpRight } from "lucide-react";
import { Card } from "../components/ui/card";
import type { SiteLinkRenderer } from "../lib/adapters";

export function ArticleEditorialLinksView({ links, variant, linkRenderer: LinkRenderer }: { links: JournalLinkDto[]; variant: "inline" | "footer"; linkRenderer: SiteLinkRenderer }) {
  if (!links.length) return null;
  if (variant === "footer") return (
    <Card className="mt-10 border-[var(--border)] bg-[var(--surface-card-soft)] p-5 md:mt-11">
      <h2 className="text-xl font-semibold leading-tight">Следующий шаг</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">{links.map((link) => (
        <LinkRenderer key={link.href} href={link.href} className="group rounded-lg border border-[var(--border)] bg-white p-4 transition hover:border-[var(--journal-border-hover)] hover:bg-[var(--accent-soft)]">
          <span className="block font-semibold leading-snug transition group-hover:text-[var(--accent)]">{link.label}</span>
          <span className="mt-2 block text-sm leading-6 text-[var(--journal-copy-muted)]">{link.description}</span>
        </LinkRenderer>
      ))}</div>
    </Card>
  );
  return (
    <Card className="mt-10 max-w-185 border-[var(--border)] bg-[var(--surface-card-soft)] p-5 md:mt-11">
      <p className="text-xs font-extrabold tracking-[.14em] text-[var(--accent)]">СМОТРИТЕ ПО ТЕМЕ</p>
      <ul className="mt-4 divide-y divide-[var(--border)]">{links.map((link, index) => (
        <li key={link.href} className="py-4 first:pt-0 last:pb-0"><LinkRenderer href={link.href} className="group flex items-start justify-between gap-4"><div className="grid grid-cols-[28px_minmax(0,1fr)] gap-3"><span className="pt-0.5 text-xs font-extrabold text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span><span><span className="block font-semibold leading-snug group-hover:text-[var(--accent)]">{link.label}</span><span className="mt-1 block text-sm leading-6 text-[var(--journal-copy-muted)]">{link.description}</span></span></div><ArrowUpRight className="mt-0.5 size-4 shrink-0 text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100" /></LinkRenderer></li>
      ))}</ul>
    </Card>
  );
}
