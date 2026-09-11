import type { NewBuildingDetailViewModel, NewBuildingExpertViewModel } from "../contracts/new-building";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Banknote, Building2, Bus, GraduationCap, Landmark, MapPin } from "lucide-react";
import type { SiteImageRenderer } from "../lib/adapters";

type NewBuildingSectionProps = { detail: NewBuildingDetailViewModel; contained?: boolean };

function sectionFrame(contained: boolean) {
  return {
    frame: contained ? "" : "mx-auto max-w-site-frame px-5",
    section: contained ? "bg-white pt-6 text-[var(--text-primary)] md:pt-7 lg:pt-8" : "bg-white py-10 text-[var(--text-primary)] md:py-12 lg:py-14",
  };
}

export function NewBuildingAboutView({ detail, contained = false }: NewBuildingSectionProps) {
  const projectSummary = [
    detail.classLabel ? { label: "Класс", value: detail.classLabel } : null,
    detail.areaFrom && detail.areaTo ? { label: "Площади", value: `${detail.areaFrom}-${detail.areaTo} м²` } : null,
    detail.formats.length > 0 ? { label: "Форматы", value: detail.formats.join(", ") } : null,
    detail.buildingsLabel ? { label: "Корпуса", value: detail.buildingsLabel } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const frame = sectionFrame(contained);

  return (
    <section className={contained ? "bg-white pt-8 text-[var(--text-primary)] md:pt-9 lg:pt-10" : frame.section}>
      <div className={frame.frame}>
        <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--new-building-section-shadow-subtle)] md:p-6 lg:p-7">
          <div className="max-w-195">
            <h2 className="text-heading-compact font-semibold leading-tight text-[var(--text-primary)] md:text-section-small">О проекте</h2>
            <p className="mt-4 hidden text-section-small font-extrabold leading-[1.12] text-[var(--text-primary)] lg:block lg:text-heading-large">{detail.name}</p>
            <p className="mt-4 hidden items-start gap-2.5 text-sm font-semibold leading-6 text-[var(--text-secondary)] lg:flex">
              <MapPin className="mt-1 size-4 shrink-0 text-[var(--accent)]" aria-hidden />{detail.address}
            </p>
            <p className="mt-5 text-body font-normal leading-[1.62] text-[var(--text-secondary)] md:text-body-compact">{detail.about.intro}</p>
          </div>
          {projectSummary.length > 0 ? (
            <dl className="mt-7 hidden gap-2 border-y border-[var(--border)] py-4 sm:grid-cols-2 lg:grid xl:grid-cols-4">
              {projectSummary.map((item) => <div key={item.label} className="rounded-lg bg-[var(--surface-card-soft)] px-4 py-3"><dt className="text-caption font-semibold uppercase leading-4 text-[var(--text-muted)]">{item.label}</dt><dd className="mt-1 text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.value}</dd></div>)}
            </dl>
          ) : null}
          <div className="mt-7 hidden lg:block">
            <p className="text-xs font-semibold leading-5 text-[var(--text-primary)]">Преимущества</p>
            <ol className="mt-4 grid gap-3 md:grid-cols-2">
              {detail.about.features.slice(0, 4).map((feature, index) => (
                <li key={feature.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-4">
                  <div className="grid size-9 place-items-center rounded-lg bg-[var(--surface-muted)] text-label font-extrabold text-[var(--accent)] tabular-nums">{String(index + 1).padStart(2, "0")}</div>
                  <div><h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{feature.title}</h3><p className="mt-1.5 text-xs leading-5 text-[var(--new-building-supporting-content)]">{feature.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewBuildingPurchaseTermsView({ detail, contained = false }: NewBuildingSectionProps) {
  const mobileTerms = [
    { title: "Ипотека", value: "Условия банка", text: "Сравним применимые программы и поможем подготовить заявку. Решение принимает банк." },
    { title: "Материнский капитал", value: "Проверим возможность", text: "Уточним, можно ли использовать сертификат для выбранной квартиры и схемы покупки." },
    { title: "Полная оплата", value: "Без кредита", text: "Проверим актуальную цену, порядок расчётов и документы до бронирования." },
  ];
  const desktopTerms = detail.purchaseOptions.slice(0, 2);
  const icons: LucideIcon[] = [Landmark, BadgeCheck, Building2, Banknote];
  const frame = sectionFrame(contained);
  return (
    <section className={frame.section}><div className={frame.frame}><div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--new-building-section-shadow-subtle)] md:p-6 lg:p-7">
      <div className="max-w-195"><h2 className="text-card-large font-semibold leading-[1.18] text-[var(--text-primary)] md:text-section-base">Способы покупки в {detail.name}</h2></div>
      <div className="mt-5 grid gap-3 md:grid-cols-3 lg:hidden">{mobileTerms.map((term, index) => { const Icon = icons[index % icons.length]; return (
        <article key={term.title} className="grid min-h-42 grid-rows-[auto_1fr] rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-4">
          <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[var(--surface-muted)] text-label font-extrabold text-[var(--accent)] tabular-nums">{String(index + 1).padStart(2, "0")}</span><span className="grid size-9 place-items-center rounded-lg bg-white text-[var(--accent)]"><Icon aria-hidden="true" size={17} strokeWidth={1.9} /></span></div>
          <div className="mt-4"><p className="text-sm font-semibold leading-5 text-[var(--accent)]">{term.value}</p><h3 className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{term.title}</h3><p className="mt-1.5 text-xs leading-5 text-[var(--new-building-supporting-content)]">{term.text}</p></div>
        </article>
      ); })}</div>
      {desktopTerms.length > 0 ? <div className={contained ? "mt-5 hidden gap-3 lg:grid lg:grid-cols-2" : "mt-7 hidden gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-4"}>{desktopTerms.map((term, index) => { const Icon = icons[index % icons.length]; return (
        <article key={term.title} className="grid min-h-44.5 grid-rows-[auto_1fr_auto] rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-4">
          <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[var(--surface-muted)] text-label font-extrabold text-[var(--accent)] tabular-nums">{String(index + 1).padStart(2, "0")}</span><span className="grid size-9 place-items-center rounded-lg bg-white text-[var(--accent)]"><Icon aria-hidden="true" size={17} strokeWidth={1.9} /></span></div>
          <div className="mt-4"><p className="text-sm font-semibold leading-5 text-[var(--accent)]">{term.value ?? term.title}</p><h3 className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{term.title}</h3><p className="mt-1.5 text-xs leading-5 text-[var(--new-building-supporting-content)]">{term.text}</p></div>
        </article>
      ); })}</div> : null}
    </div></div></section>
  );
}

export function NewBuildingSelectionView({ detail: _detail, contained = false, cityPrepositional, expert, imageRenderer: Image, requestAction, headingLead }: NewBuildingSectionProps & { cityPrepositional: string; expert: NewBuildingExpertViewModel; imageRenderer: SiteImageRenderer; requestAction: ReactNode; headingLead: string }) {
  const frame = sectionFrame(contained);
  return (
    <section className={frame.section}><div className={frame.frame}><div className="group overflow-hidden rounded-lg border border-[var(--new-building-expert-border)] bg-[var(--new-building-expert-surface)] shadow-[var(--new-building-section-shadow-raised)] transition duration-200 hover:border-[var(--input)] hover:shadow-[var(--new-building-section-shadow-hover)]">
      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative flex min-h-75 flex-col justify-center p-6 md:p-7 lg:min-h-81.5 lg:p-8"><span className="mb-7 block h-1 w-14 rounded-full bg-[var(--accent)]" aria-hidden /><h2 className="max-w-130 text-section-prominent font-extrabold leading-[1.06] text-[var(--text-primary)] md:text-display-small lg:text-display-base"><span className="block">{headingLead}</span><span className="block">новостроек в {cityPrepositional}</span></h2><p className="mt-5 max-w-125 text-body font-normal leading-[1.62] text-[var(--text-secondary)] md:text-body-compact">Сравним условия всех застройщиков и найдём для вас акции, о которых не пишут в рекламе.</p>{requestAction}</div>
        <div className="relative min-h-57.5 overflow-hidden border-t border-[var(--new-building-expert-border)] bg-[var(--surface-card-soft)] md:min-h-full md:border-l md:border-t-0"><Image src={expert.portrait} alt={`${expert.name}, ${expert.role}`} fill quality={95} sizes="(max-width: 768px) calc(100vw - 40px), 340px" className="object-cover object-[50%_50%] transition duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-[linear-gradient(180deg,var(--new-building-expert-overlay-transparent)_40%,var(--new-building-expert-overlay-soft)_100%)]" /></div>
      </div>
    </div></div></section>
  );
}

export function NewBuildingLocationView({ detail, contained = false, map }: NewBuildingSectionProps & { map: ReactNode }) {
  const frame = sectionFrame(contained);
  return (
    <section className={frame.section}><div className={frame.frame}><div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--new-building-section-shadow-subtle)] md:p-6 lg:p-7">
      <div className="max-w-195"><h2 className="text-card-large font-semibold leading-[1.18] text-[var(--text-primary)] md:text-section-base">Адрес жилого комплекса</h2><p className="mt-4 flex items-start gap-2.5 text-sm font-semibold leading-6 text-[var(--text-secondary)]"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" aria-hidden />{detail.address}</p></div>
      <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] lg:grid lg:grid-cols-[minmax(0,1fr)_260px]">
        {map}
        <div className="grid content-start gap-2 border-t border-[var(--border)] p-3 lg:hidden">{detail.location.items.slice(0, 3).map((item) => { const Icon = getInfrastructureIcon(item.title); return (
          <article key={`${item.title}-${item.timeLabel}`} className="rounded-lg border border-[var(--border)] bg-white p-3"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-4" aria-hidden /></span><h3 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.title}</h3>{item.timeLabel ? <span className="shrink-0 rounded-md bg-[var(--surface-card-soft)] px-2 py-1 text-caption font-semibold text-[var(--text-secondary)]">{item.timeLabel}</span> : null}</div></article>
        ); })}</div>
        <div className="hidden content-start gap-2 border-l border-[var(--border)] p-3 lg:grid">{detail.location.items.slice(0, 6).map((item) => { const Icon = getInfrastructureIcon(item.title); return (
          <article key={`${item.title}-${item.timeLabel}`} className="rounded-lg border border-[var(--border)] bg-white p-3"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-4" aria-hidden /></span><div className="min-w-0"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.title}</h3>{item.timeLabel ? <span className="shrink-0 rounded-md bg-[var(--surface-card-soft)] px-2 py-1 text-caption font-semibold text-[var(--text-secondary)]">{item.timeLabel}</span> : null}</div><p className="mt-1 text-xs leading-5 text-[var(--new-building-supporting-content)]">{item.text}</p></div></div></article>
        ); })}</div>
      </div>
    </div></div></section>
  );
}

function getInfrastructureIcon(title: string): LucideIcon {
  const normalized = title.toLowerCase();
  if (normalized.includes("останов")) return Bus;
  if (normalized.includes("школ")) return GraduationCap;
  if (normalized.includes("мфц")) return Landmark;
  return Building2;
}
