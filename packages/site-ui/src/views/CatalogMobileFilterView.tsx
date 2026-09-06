"use client";

import { ArrowUpDown, Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import type { CatalogFacetsDto } from "@starter/site-contracts";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";

export type MobileTypeId = "flat" | "new_building" | "house" | "land" | "commercial" | "construction";
export type MobileRoomId = "studio" | "1" | "2" | "3" | "4plus";
export type MobileFilterDraftViewDto = {
  q: string; types: MobileTypeId[]; rooms: MobileRoomId[]; priceFrom: string; priceTo: string;
  areaFrom: string; areaTo: string; district: string; exclusive: boolean; buildingType: string;
  renovation: string; sort: string; view: string; city: string; dealType: string;
};

export const MOBILE_TYPE_VIEW_OPTIONS: Array<{ id: MobileTypeId; label: string }> = [
  { id: "flat", label: "Вторичка" }, { id: "new_building", label: "Новостройки" },
  { id: "house", label: "Дома" }, { id: "land", label: "Участки" },
  { id: "commercial", label: "Коммерция" }, { id: "construction", label: "Строительство" },
];
const ROOM_CHIPS: Array<{ id: MobileRoomId; label: string }> = [
  { id: "studio", label: "Студия" }, { id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4plus", label: "4+" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" }, { value: "price_asc", label: "Сначала дешевле" }, { value: "price_desc", label: "Сначала дороже" },
] as const;

export function CatalogMobileFilterView({ draft, setDraft, facets, typeSummary, sortLabel, sortOpen, setSortOpen, sortRef, advancedOpen, setAdvancedOpen, filtersSheetOpen, setFiltersSheetOpen, typeOpen, setTypeOpen, onToggleType, onToggleRoom, onClear, onApply, applyLabel }: {
  draft: MobileFilterDraftViewDto;
  setDraft: Dispatch<SetStateAction<MobileFilterDraftViewDto>>;
  facets: CatalogFacetsDto;
  typeSummary: string;
  sortLabel: string;
  sortOpen: boolean;
  setSortOpen: (open: boolean) => void;
  sortRef: RefObject<HTMLDivElement | null>;
  advancedOpen: boolean;
  setAdvancedOpen: Dispatch<SetStateAction<boolean>>;
  filtersSheetOpen: boolean;
  setFiltersSheetOpen: (open: boolean) => void;
  typeOpen: boolean;
  setTypeOpen: (open: boolean) => void;
  onToggleType: (id: MobileTypeId) => void;
  onToggleRoom: (id: MobileRoomId) => void;
  onClear: () => void;
  onApply: () => void;
  applyLabel: string;
}) {
  const fields = (showAdvancedAlways: boolean) => <MobileFilterFields draft={draft} setDraft={setDraft} facets={facets} typeSummary={typeSummary} sortLabel={sortLabel} sortOpen={sortOpen} setSortOpen={setSortOpen} sortRef={sortRef} advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen} showAdvancedAlways={showAdvancedAlways} onOpenType={() => setTypeOpen(true)} onToggleRoom={onToggleRoom} onClear={onClear} />;
  return <div className="mt-4 space-y-2.5 lg:hidden">
    {fields(false)}
    <ApplyButton label={applyLabel} onClick={onApply} />
    <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
      <SheetContent side="bottom" className="inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-0 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(23,22,26,0.18)] lg:hidden" showClose>
        <SheetHeader className="mb-3"><SheetTitle className="text-[15px] font-semibold">Фильтры</SheetTitle></SheetHeader>
        <div className="space-y-2.5">{fields(true)}<ApplyButton label={applyLabel} onClick={onApply} /></div>
      </SheetContent>
    </Sheet>
    <Sheet open={typeOpen} onOpenChange={setTypeOpen}>
      <SheetContent side="bottom" className="inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-0 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(23,22,26,0.18)] lg:hidden" showClose>
        <SheetHeader className="mb-3"><SheetTitle className="text-[15px] font-semibold">Тип недвижимости</SheetTitle></SheetHeader>
        <ul className="space-y-0.5">{MOBILE_TYPE_VIEW_OPTIONS.map((option) => { const checked = draft.types.includes(option.id); return <li key={option.id}><button type="button" onClick={() => onToggleType(option.id)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 text-left text-[13px] font-medium text-[var(--text-primary)]"><span>{option.label}</span><span className={`inline-flex size-5 items-center justify-center rounded border ${checked ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--input)] bg-white"}`}>{checked ? <Check className="size-3.5" aria-hidden /> : null}</span></button></li>; })}</ul>
        <button type="button" onClick={() => setTypeOpen(false)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--surface-dark)] text-[13px] font-semibold text-white">Готово</button>
      </SheetContent>
    </Sheet>
  </div>;
}

function ApplyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--surface-dark)] px-4 text-[13px] font-semibold text-white transition hover:bg-[var(--palette-2a292d)]">{label}</button>;
}

function MobileFilterFields({ draft, setDraft, facets, typeSummary, sortLabel, sortOpen, setSortOpen, sortRef, advancedOpen, setAdvancedOpen, showAdvancedAlways, onOpenType, onToggleRoom, onClear }: {
  draft: MobileFilterDraftViewDto; setDraft: Dispatch<SetStateAction<MobileFilterDraftViewDto>>; facets: CatalogFacetsDto; typeSummary: string; sortLabel: string; sortOpen: boolean; setSortOpen: (open: boolean) => void; sortRef: RefObject<HTMLDivElement | null>; advancedOpen: boolean; setAdvancedOpen: Dispatch<SetStateAction<boolean>>; showAdvancedAlways: boolean; onOpenType: () => void; onToggleRoom: (id: MobileRoomId) => void; onClear: () => void;
}) {
  const advancedVisible = showAdvancedAlways || advancedOpen;
  return <>
    <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--palette-f5f5f5)] px-3"><Search className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden /><span className="sr-only">Поиск по каталогу</span><input value={draft.q} onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))} placeholder="Поиск ЖК, улицы, района" className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-[var(--text-muted)]" /></label>
    <button type="button" onClick={onOpenType} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--palette-f5f5f5)] px-3 text-left text-[13px] font-medium text-[var(--text-primary)]"><span className="min-w-0 truncate">{typeSummary}</span><ChevronDown className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden /></button>
    <div className="grid grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] gap-1.5">{ROOM_CHIPS.map((chip) => { const active = draft.rooms.includes(chip.id); return <button key={chip.id} type="button" onClick={() => onToggleRoom(chip.id)} className={`min-h-11 w-full rounded-lg border px-3 py-2 text-center text-[12px] font-semibold transition ${active ? "border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white" : "border-[var(--border)] bg-[var(--palette-f5f5f5)] text-[var(--text-secondary)]"}`}>{chip.label}</button>; })}</div>
    <div className="grid grid-cols-1 gap-2"><RangeField from={draft.priceFrom} to={draft.priceTo} onFrom={(value) => setDraft((current) => ({ ...current, priceFrom: value }))} onTo={(value) => setDraft((current) => ({ ...current, priceTo: value }))} fromPlaceholder="от 1,5 млн" toPlaceholder="до 50 млн" inputMode="decimal" numericOnly={false} /><RangeField from={draft.areaFrom} to={draft.areaTo} onFrom={(value) => setDraft((current) => ({ ...current, areaFrom: value }))} onTo={(value) => setDraft((current) => ({ ...current, areaTo: value }))} fromPlaceholder="от 20 м²" toPlaceholder="до 250 м²" /></div>
    {advancedVisible ? <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--palette-f8f8f7)] p-3">
      <SmallSelect title="Район" value={draft.district} options={facets.districts} onChange={(district) => setDraft((current) => ({ ...current, district }))} />
      <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--palette-f5f5f5)] px-3 text-[13px] font-medium text-[var(--text-secondary)]"><input type="checkbox" checked={draft.exclusive} onChange={(event) => setDraft((current) => ({ ...current, exclusive: event.target.checked }))} className="size-4 accent-[var(--accent)]" />Только эксклюзивы</label>
      <SmallSelect title="Тип дома" value={draft.buildingType} options={facets.buildingTypes} onChange={(buildingType) => setDraft((current) => ({ ...current, buildingType }))} />
      <SmallSelect title="Ремонт" value={draft.renovation} options={facets.renovations} onChange={(renovation) => setDraft((current) => ({ ...current, renovation }))} />
      <button type="button" onClick={onClear} className="inline-flex min-h-10 w-full items-center justify-center rounded-lg text-[13px] font-semibold text-[var(--accent)]">Очистить</button>
    </div> : null}
    <div className="flex items-center justify-between gap-2 pt-0.5"><div ref={sortRef} className="relative min-w-0"><button type="button" onClick={() => setSortOpen(!sortOpen)} className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--palette-f5f5f5)] px-2.5 text-[12px] font-semibold text-[var(--text-secondary)]" aria-expanded={sortOpen}><ArrowUpDown className="size-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden /><span className="truncate">{sortLabel}</span><ChevronDown className={`size-3.5 shrink-0 text-[var(--text-muted)] transition ${sortOpen ? "rotate-180" : ""}`} aria-hidden /></button>{sortOpen ? <div className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[200px] overflow-hidden rounded-lg border border-[var(--border)] bg-white py-1 shadow-[0_12px_28px_rgba(23,22,26,0.12)]">{SORT_OPTIONS.map((option) => { const active = draft.sort === option.value; return <button key={option.value} type="button" onClick={() => { setDraft((current) => ({ ...current, sort: option.value })); setSortOpen(false); }} className={`flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-[13px] font-medium ${active ? "bg-[var(--surface-card-soft)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}><span>{option.label}</span>{active ? <Check className="size-3.5 text-[var(--accent)]" aria-hidden /> : null}</button>; })}</div> : null}</div>
      {showAdvancedAlways ? null : <button type="button" onClick={() => setAdvancedOpen((open) => !open)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold ${advancedOpen ? "border border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white" : "border border-[var(--border)] bg-[var(--palette-f5f5f5)] text-[var(--text-secondary)]"}`} aria-expanded={advancedOpen}><SlidersHorizontal className="size-3.5" aria-hidden />Фильтры</button>}
    </div>
  </>;
}

function SmallSelect({ title, value, options, onChange }: { title: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{title}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--palette-f5f5f5)] px-3 text-[13px] font-medium normal-case tracking-[0] text-[var(--text-primary)]"><option value="">Любой</option>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
}

function RangeField({ from, to, onFrom, onTo, fromPlaceholder, toPlaceholder, inputMode = "numeric", numericOnly = true }: { from: string; to: string; onFrom: (value: string) => void; onTo: (value: string) => void; fromPlaceholder: string; toPlaceholder: string; inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"; numericOnly?: boolean }) {
  const normalize = (value: string) => numericOnly ? value.replace(/[^\d]/g, "") : value.replace(/[^\d\s,.мМлЛнНmM]/g, "");
  return <div className="min-w-0"><div className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--palette-f5f5f5)] px-3"><input inputMode={inputMode} value={from} onChange={(event) => onFrom(normalize(event.target.value))} placeholder={fromPlaceholder} className="min-w-0 flex-1 bg-transparent text-[13px] font-medium tabular-nums text-[var(--text-primary)] outline-none placeholder:text-[var(--palette-a8a6a8)]" /><span className="text-[12px] text-[var(--palette-a8a6a8)]">–</span><input inputMode={inputMode} value={to} onChange={(event) => onTo(normalize(event.target.value))} placeholder={toPlaceholder} className="min-w-0 flex-1 bg-transparent text-[13px] font-medium tabular-nums text-[var(--text-primary)] outline-none placeholder:text-[var(--palette-a8a6a8)]" /></div></div>;
}
