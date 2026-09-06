"use client";

import type { PropertyDetailRowDto, PropertyDetailSummaryItemDto } from "@starter/site-contracts";
import { BedDouble, Building, Building2, MapPin, Ruler } from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/card";

const SUMMARY_ICONS = {
  area: Ruler,
  "living-area": BedDouble,
  kitchen: Building2,
  floor: Building,
  rooms: BedDouble,
} as const;

export function PropertyDetailSummaryView({
  title,
  address,
  addressHidden = false,
  exclusive = false,
  items,
}: {
  title: string;
  address?: string | null;
  addressHidden?: boolean;
  exclusive?: boolean;
  items: PropertyDetailSummaryItemDto[];
}) {
  return (
    <Card className="grid gap-4 rounded-lg border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-page-title">
      <div className="grid gap-2">
        {exclusive ? (
          <span data-exclusive-badge className="inline-flex min-h-7 w-fit items-center rounded-md bg-[var(--accent)] px-2.5 text-xs font-bold leading-none text-white">
            Эксклюзив
          </span>
        ) : null}
        <h1 id="object-page-title" className="text-[clamp(22px,2vw,30px)] font-semibold leading-[1.16] text-[var(--text-primary)]">
          {title}
        </h1>
        {address ? (
          <p className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-normal leading-5 text-[var(--text-secondary)]">
            <MapPin className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
            <span>{address}{addressHidden ? <span aria-label="Номер дома скрыт" className="inline-flex select-none align-baseline text-slate-400">…</span> : null}</span>
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Коротко об объекте</p>
      </div>
      <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-md:grid-cols-1">
        {items.map((item) => {
          const Icon = SUMMARY_ICONS[item.icon];
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white px-3 py-3">
              <Icon className="size-5 shrink-0 text-[var(--text-secondary)]" aria-hidden />
              <div className="grid min-w-0 gap-0.5">
                <strong className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.value}</strong>
                <span className="text-[11px] leading-4 text-[var(--text-muted)]">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function PropertyDescriptionView({ paragraphs, objectId, updatedLabel }: { paragraphs?: string[]; objectId: string; updatedLabel?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!paragraphs?.length) return null;

  const shouldCollapse = paragraphs.join(" ").length > 420 || paragraphs.length > 2;
  const visibleParagraphs = shouldCollapse && !expanded ? paragraphs.slice(0, 2) : paragraphs;

  return (
    <Card className="grid gap-4 rounded-lg border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-description-title">
      <h2 id="object-description-title" className="scroll-mt-[130px] text-[22px] font-semibold leading-tight text-[var(--text-primary)]">Описание</h2>
      <div className="grid w-full gap-2 text-[13px] font-normal leading-[1.55] text-[var(--text-secondary)] md:text-sm md:leading-[1.55]">
        {visibleParagraphs.map((paragraph, index) => (
          <p key={`${paragraph.slice(0, 32)}-${index}`}>
            {paragraph}{shouldCollapse && !expanded && index === visibleParagraphs.length - 1 ? "..." : ""}
          </p>
        ))}
      </div>
      {shouldCollapse ? (
        <button type="button" onClick={() => setExpanded((current) => !current)} className="justify-self-start text-sm font-semibold leading-5 text-[var(--accent)] transition hover:text-[var(--accent-hover)]" aria-expanded={expanded}>
          {expanded ? "Свернуть" : "Подробнее"}
        </button>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium leading-5 text-[var(--text-muted)]">
        <span>ID объекта: <span className="tabular-nums">{objectId}</span></span>
        {updatedLabel ? <span>Обновлено {updatedLabel}</span> : null}
      </div>
    </Card>
  );
}

export function PropertyDetailsView({ title, rows }: { title: string; rows: PropertyDetailRowDto[] }) {
  return (
    <Card className="grid gap-4 rounded-lg border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-details-title">
      <h2 id="object-details-title" className="scroll-mt-[130px] text-[22px] font-semibold leading-tight text-[var(--text-primary)]">{title}</h2>
      <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="grid grid-cols-[auto_minmax(32px,1fr)_auto] items-baseline gap-2 text-sm leading-6">
            <span className="text-[var(--text-secondary)]">{row.label}</span>
            <span className="border-b border-dotted border-[var(--input)]" aria-hidden />
            <span className="max-w-[220px] text-right font-semibold text-[var(--text-primary)]">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PropertyBuildingView({ description }: { description: string }) {
  return (
    <Card className="grid gap-3.5 rounded-lg border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-building-title">
      <h2 id="object-building-title" className="scroll-mt-[130px] text-[22px] font-semibold leading-tight text-[var(--text-primary)]">Дом и район</h2>
      <p className="text-[13px] font-normal leading-6 text-[var(--text-secondary)] md:text-sm">{description}</p>
    </Card>
  );
}
