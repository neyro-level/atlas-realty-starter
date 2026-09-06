import type { HouseProjectPreviewDto } from "@starter/site-contracts";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteLinkRenderer } from "../lib/adapters";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";

export function HouseProjectPreviewView({
  project,
  structuredData,
  breadcrumbs,
  actions,
  linkRenderer: Link,
}: {
  project: HouseProjectPreviewDto;
  structuredData?: ReactNode;
  breadcrumbs: ReactNode;
  actions: ReactNode;
  linkRenderer: SiteLinkRenderer;
}) {
  return (
    <main className="min-h-screen bg-white text-[var(--text-primary)]">
      {structuredData}
      <div className="mx-auto max-w-site-frame px-5 py-8">
        <div className="mb-4">{breadcrumbs}</div>
        <Link
          href={project.backHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Вернуться к строительству
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden rounded-lg border-[var(--border)] bg-[var(--surface-muted)]">
            <svg viewBox="0 0 640 420" role="img" aria-label={`Проект дома ${project.areaLabel}`} className="h-full w-full">
              <rect width="640" height="420" fill="var(--surface-muted)" />
              <path d="M82 326H558" stroke="var(--input)" strokeWidth="3" />
              <path d="M136 242L320 92L504 242" fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinejoin="round" />
              <path d="M190 238H450V330H190z" fill="var(--surface)" stroke="var(--palette-c8c8c6)" strokeWidth="4" />
              <path d="M238 330V262H298V330" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="4" />
              <path d="M338 262H412V306H338z" fill="var(--surface-card-soft)" stroke="var(--palette-c8c8c6)" strokeWidth="4" />
              <text x="320" y="62" textAnchor="middle" fill="var(--text-primary)" fontSize="30" fontWeight="800">
                {project.numberLabel} / {project.areaLabel}
              </text>
            </svg>
          </Card>

          <Card className="rounded-lg border-[var(--border)] bg-[var(--surface-card-soft)] p-6">
            <Badge variant="soft" className="border-0 rounded-md px-3 py-1 text-sm font-bold">Preview-проект</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight">{project.title}</h1>
            <p className="mt-4 text-3xl font-extrabold tabular-nums text-[var(--accent)]">{project.areaLabel}</p>
            <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">{project.description}</p>
            {actions}
          </Card>
        </section>
      </div>
    </main>
  );
}
