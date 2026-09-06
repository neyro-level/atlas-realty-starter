import type { NewBuildingDetailDto } from "@starter/site-contracts";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Banknote, Building2, Bus, GraduationCap, Landmark, MapPin } from "lucide-react";
import type { SiteImageRenderer } from "../lib/adapters";

type NewBuildingSectionProps = { detail: NewBuildingDetailDto; contained?: boolean };

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
        <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-6 lg:p-7">
          <div className="max-w-[780px]">
            <h2 className="text-[22px] font-semibold leading-tight text-[var(--text-primary)] md:text-[24px]">О проекте</h2>
            <p className="mt-4 text-[24px] font-extrabold leading-[1.12] text-[var(--text-primary)] md:text-[30px]">{detail.name}</p>
            <p className="mt-4 flex items-start gap-2.5 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
              <MapPin className="mt-1 size-4 shrink-0 text-[var(--accent)]" aria-hidden />{detail.address}
            </p>
            <p className="mt-5 text-[14px] font-normal leading-[1.62] text-[var(--text-secondary)] md:text-[15px]">{detail.about.intro}</p>
          </div>
          {projectSummary.length > 0 ? (
            <dl className="mt-7 grid gap-2 border-y border-[var(--border)] py-4 sm:grid-cols-2 xl:grid-cols-4">
              {projectSummary.map((item) => <div key={item.label} className="rounded-lg bg-[var(--surface-card-soft)] px-4 py-3"><dt className="text-[11px] font-semibold uppercase leading-4 text-[var(--text-muted)]">{item.label}</dt><dd className="mt-1 text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.value}</dd></div>)}
            </dl>
          ) : null}
          <div className="mt-7">
            <p className="text-xs font-semibold leading-5 text-[var(--text-primary)]">Преимущества</p>
            <ol className="mt-4 grid gap-3 md:grid-cols-2">
              {detail.about.features.slice(0, 4).map((feature, index) => (
                <li key={feature.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-4">
                  <div className="grid size-9 place-items-center rounded-lg bg-[var(--surface-muted)] text-[12px] font-extrabold text-[var(--accent)] tabular-nums">{String(index + 1).padStart(2, "0")}</div>
                  <div><h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{feature.title}</h3><p className="mt-1.5 text-xs leading-5 text-[#5E5B5E]">{feature.text}</p></div>
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
  const terms = detail.purchaseOptions.slice(0, 2);
  if (terms.length === 0) return null;
  const icons: LucideIcon[] = [Landmark, BadgeCheck, Building2, Banknote];
  const frame = sectionFrame(contained);
  const gridClassName = contained ? "mt-5 grid gap-3 md:grid-cols-2" : "mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4";
  return (
    <section className={frame.section}><div className={frame.frame}><div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-6 lg:p-7">
      <div className="max-w-[780px]"><h2 className="text-[21px] font-semibold leading-[1.18] text-[var(--text-primary)] md:text-[25px]">Способы покупки в {detail.name}</h2></div>
      <div className={gridClassName}>{terms.map((term, index) => { const Icon = icons[index % icons.length]; return (
        <article key={term.title} className="grid min-h-[178px] grid-rows-[auto_1fr_auto] rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-4">
          <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[var(--surface-muted)] text-[12px] font-extrabold text-[var(--accent)] tabular-nums">{String(index + 1).padStart(2, "0")}</span><span className="grid size-9 place-items-center rounded-lg bg-white text-[var(--accent)]"><Icon aria-hidden="true" size={17} strokeWidth={1.9} /></span></div>
          <div className="mt-4"><p className="text-sm font-semibold leading-5 text-[var(--accent)]">{term.value ?? term.title}</p><h3 className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{term.title}</h3><p className="mt-1.5 text-xs leading-5 text-[#5E5B5E]">{term.text}</p></div>
        </article>
      ); })}</div>
    </div></div></section>
  );
}

export function NewBuildingSelectionView({ detail: _detail, contained = false, imageRenderer: Image, requestAction }: NewBuildingSectionProps & { imageRenderer: SiteImageRenderer; requestAction: ReactNode }) {
  const frame = sectionFrame(contained);
  return (
    <section className={frame.section}><div className={frame.frame}><div className="group overflow-hidden rounded-lg border border-[#DDDCD8] bg-[#F5F5F3] shadow-[0_1px_2px_rgba(0,0,0,0.025),0_20px_48px_rgba(0,0,0,0.055)] transition duration-200 hover:border-[#D0D0CD] hover:shadow-[0_2px_4px_rgba(0,0,0,0.035),0_26px_64px_rgba(0,0,0,0.085)]">
      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative flex min-h-[300px] flex-col justify-center p-6 md:p-7 lg:min-h-[326px] lg:p-8"><span className="mb-7 block h-1 w-14 rounded-full bg-[var(--accent)]" aria-hidden /><h2 className="max-w-[520px] text-[28px] font-extrabold leading-[1.06] text-[var(--text-primary)] md:text-[34px] lg:text-[36px]"><span className="block">Бесплатный подбор</span><span className="block">новостроек в вашем городе</span></h2><p className="mt-5 max-w-[500px] text-[14px] font-normal leading-[1.62] text-[var(--text-secondary)] md:text-[15px]">Сравним условия всех застройщиков и найдём для вас акции, о которых не пишут в рекламе.</p>{requestAction}</div>
        <div className="relative min-h-[230px] overflow-hidden border-t border-[#DDDCD8] bg-[linear-gradient(145deg,#F7F7F5_0%,#ECECE8_54%,var(--surface)_100%)] md:min-h-full md:border-l md:border-t-0"><Image src="/images/catalog-buyer-expert.png" alt="Эксперт агентства недвижимости помогает выбрать квартиру в новостройке" fill quality={95} sizes="(max-width: 768px) calc(100vw - 40px), 340px" className="object-cover object-[50%_50%] transition duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,16,17,0)_40%,rgba(16,16,17,0.18)_100%)]" /></div>
      </div>
    </div></div></section>
  );
}

export function NewBuildingLocationView({ detail, contained = false, map }: NewBuildingSectionProps & { map: ReactNode }) {
  const frame = sectionFrame(contained);
  return (
    <section className={frame.section}><div className={frame.frame}><div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-6 lg:p-7">
      <div className="max-w-[780px]"><h2 className="text-[21px] font-semibold leading-[1.18] text-[var(--text-primary)] md:text-[25px]">Адрес жилого комплекса</h2><p className="mt-4 flex items-start gap-2.5 text-sm font-semibold leading-6 text-[var(--text-secondary)]"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" aria-hidden />{detail.address}</p></div>
      <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] lg:grid lg:grid-cols-[minmax(0,1fr)_260px]">
        {map}
        <div className="grid content-start gap-2 border-t border-[var(--border)] p-3 lg:border-l lg:border-t-0">{detail.location.items.slice(0, 6).map((item) => { const Icon = getInfrastructureIcon(item.title); return (
          <article key={`${item.title}-${item.timeLabel}`} className="rounded-lg border border-[var(--border)] bg-white p-3"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-4" aria-hidden /></span><div className="min-w-0"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.title}</h3>{item.timeLabel ? <span className="shrink-0 rounded-md bg-[var(--surface-card-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">{item.timeLabel}</span> : null}</div><p className="mt-1 text-xs leading-5 text-[#5E5B5E]">{item.text}</p></div></div></article>
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
