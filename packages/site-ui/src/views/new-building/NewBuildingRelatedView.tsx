import type { NewBuildingSummaryViewModel } from "../../contracts/new-building";
import { Fragment, type ReactNode } from "react";

export function NewBuildingRelatedView({ related, contained = false, renderCard }: { related: NewBuildingSummaryViewModel[]; contained?: boolean; renderCard: (item: NewBuildingSummaryViewModel) => ReactNode }) {
  if (related.length === 0) return null;
  const frameClassName = contained ? "" : "mx-auto max-w-site-frame px-5";
  const gridClassName = contained ? "mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4";
  const sectionClassName = contained ? "bg-[var(--surface-card)] pt-6 text-[var(--text-primary)] md:pt-7 lg:pt-8" : "bg-[var(--surface-card)] py-10 text-[var(--text-primary)] md:py-12 lg:py-14";
  return <section className={sectionClassName}><div className={frameClassName}><div className="rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--new-building-section-shadow-subtle)] md:p-6 lg:p-7"><div className="max-w-195"><h2 className="text-heading-compact font-semibold leading-tight-copy text-[var(--text-primary)] md:text-section-small">Похожие жилые комплексы</h2></div><div className={gridClassName}>{related.map((item) => <Fragment key={item.id}>{renderCard(item)}</Fragment>)}</div></div></div></section>;
}
