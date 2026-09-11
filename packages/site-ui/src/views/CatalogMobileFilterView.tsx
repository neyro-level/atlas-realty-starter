"use client";

import { Select } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { ArrowUpDown, Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import type { CatalogFacetsDto } from "../contracts/catalog";
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

export function CatalogMobileFilterView({ mode = "default", draft, setDraft, facets, typeSummary, sortLabel, sortOpen, setSortOpen, sortRef, advancedOpen, setAdvancedOpen, filtersSheetOpen, setFiltersSheetOpen, typeOpen, setTypeOpen, onToggleType, onToggleRoom, onClear, onApply, applyLabel }: {
  mode?: "default" | "new-buildings";
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
  if (mode === "new-buildings") {
    return (
      <div className="mt-4 grid gap-2.5 lg:hidden" data-new-building-mobile-filter>
        <SearchField draft={draft} setDraft={setDraft} />
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2">
          <Button variant="plain"
            type="button"
            onClick={() => setFiltersSheetOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--surface-dark)] bg-white px-3 text-support font-semibold text-[var(--text-primary)]"
          >
            <SlidersHorizontal className="" aria-hidden />
            Фильтры
          </Button>
          <ApplyButton label={applyLabel} onClick={onApply} />
        </div>
        <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
          <SheetContent side="bottom" className="inset-x-0 bottom-0 max-h-[var(--viewport-dialog-max-height)] overflow-y-auto rounded-t-2xl border-0 bg-white p-4 pb-[var(--spacing-safe-footer)] shadow-[var(--catalog-mobile-filter-shadow-drawer)] lg:hidden" showClose>
            <SheetHeader className="mb-4"><SheetTitle className="text-body-compact font-semibold">Фильтры новостроек</SheetTitle></SheetHeader>
            <div className="grid gap-3">
              <SearchField draft={draft} setDraft={setDraft} />
              <div>
                <p className="mb-1.5 text-caption font-semibold uppercase text-[var(--text-muted)]">Цена</p>
                <RangeField from={draft.priceFrom} to={draft.priceTo} onFrom={(value) => setDraft((current) => ({ ...current, priceFrom: value }))} onTo={(value) => setDraft((current) => ({ ...current, priceTo: value }))} fromPlaceholder="от 3 млн" toPlaceholder="до 12 млн" inputMode="decimal" numericOnly={false} />
              </div>
              <label className="block text-caption font-semibold uppercase text-[var(--text-muted)]">
                Порядок
                <Select variant="plain" value={draft.sort} onChange={(event) => setDraft((current) => ({ ...current, sort: event.target.value }))} className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3 text-support font-medium normal-case text-[var(--text-primary)]">
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </label>
              <Button variant="plain" type="button" onClick={onClear} className="inline-flex min-h-10 w-full items-center justify-center rounded-lg text-support font-semibold text-[var(--accent)]">Очистить</Button>
              <ApplyButton label={applyLabel} onClick={onApply} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  const fields = (showAdvancedAlways: boolean) => <MobileFilterFields draft={draft} setDraft={setDraft} facets={facets} typeSummary={typeSummary} sortLabel={sortLabel} sortOpen={sortOpen} setSortOpen={setSortOpen} sortRef={sortRef} advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen} showAdvancedAlways={showAdvancedAlways} onOpenType={() => setTypeOpen(true)} onToggleRoom={onToggleRoom} onClear={onClear} />;
  return <div className="mt-4 grid gap-2.5 lg:hidden">
    {fields(false)}
    <ApplyButton label={applyLabel} onClick={onApply} />
    <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
      <SheetContent side="bottom" className="inset-x-0 bottom-0 max-h-[var(--viewport-dialog-max-height)] overflow-y-auto rounded-t-2xl border-0 bg-white p-4 pb-[var(--spacing-safe-footer)] shadow-[var(--catalog-mobile-filter-shadow-drawer)] lg:hidden" showClose>
        <SheetHeader className="mb-3"><SheetTitle className="text-body-compact font-semibold">Фильтры</SheetTitle></SheetHeader>
        <div className="grid gap-2.5">{fields(true)}<ApplyButton label={applyLabel} onClick={onApply} /></div>
      </SheetContent>
    </Sheet>
    <Sheet open={typeOpen} onOpenChange={setTypeOpen}>
      <SheetContent side="bottom" className="inset-x-0 bottom-0 max-h-[var(--viewport-dialog-max-height)] overflow-y-auto rounded-t-2xl border-0 bg-white p-4 pb-[var(--spacing-safe-footer)] shadow-[var(--catalog-mobile-filter-shadow-drawer)] lg:hidden" showClose>
        <SheetHeader className="mb-3"><SheetTitle className="text-body-compact font-semibold">Тип недвижимости</SheetTitle></SheetHeader>
        <ul className="grid gap-0.5">{MOBILE_TYPE_VIEW_OPTIONS.map((option) => { const checked = draft.types.includes(option.id); return <li key={option.id}><Button variant="plain" type="button" onClick={() => onToggleType(option.id)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 text-left text-support font-medium text-[var(--text-primary)]"><span>{option.label}</span><span className={`inline-flex size-5 items-center justify-center rounded border ${checked ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--input)] bg-white"}`}>{checked ? <Check className="" aria-hidden /> : null}</span></Button></li>; })}</ul>
        <Button variant="plain" type="button" onClick={() => setTypeOpen(false)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--surface-dark)] text-support font-semibold text-white">Готово</Button>
      </SheetContent>
    </Sheet>
  </div>;
}

function SearchField({ draft, setDraft }: { draft: MobileFilterDraftViewDto; setDraft: Dispatch<SetStateAction<MobileFilterDraftViewDto>> }) {
  return <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3"><Search className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden /><span className="sr-only">Поиск по новостройкам</span><Input variant="plain" value={draft.q} onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))} placeholder="Название ЖК, район или застройщик" className="min-w-0 flex-1 bg-transparent text-support font-medium outline-none placeholder:text-[var(--text-muted)]" /></label>;
}

function ApplyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button variant="plain" type="button" onClick={onClick} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--surface-dark)] px-4 text-support font-semibold text-white transition hover:bg-[var(--catalog-mobile-filter-surface-inverse)]">{label}</Button>;
}

function MobileFilterFields({ draft, setDraft, facets, typeSummary, sortLabel, sortOpen, setSortOpen, sortRef, advancedOpen, setAdvancedOpen, showAdvancedAlways, onOpenType, onToggleRoom, onClear }: {
  draft: MobileFilterDraftViewDto; setDraft: Dispatch<SetStateAction<MobileFilterDraftViewDto>>; facets: CatalogFacetsDto; typeSummary: string; sortLabel: string; sortOpen: boolean; setSortOpen: (open: boolean) => void; sortRef: RefObject<HTMLDivElement | null>; advancedOpen: boolean; setAdvancedOpen: Dispatch<SetStateAction<boolean>>; showAdvancedAlways: boolean; onOpenType: () => void; onToggleRoom: (id: MobileRoomId) => void; onClear: () => void;
}) {
  const advancedVisible = showAdvancedAlways || advancedOpen;
  return <>
    <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3"><Search className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden /><span className="sr-only">Поиск по каталогу</span><Input variant="plain" value={draft.q} onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))} placeholder="Поиск ЖК, улицы, района" className="min-w-0 flex-1 bg-transparent text-support font-medium outline-none placeholder:text-[var(--text-muted)]" /></label>
    <Button variant="plain" type="button" onClick={onOpenType} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3 text-left text-support font-medium text-[var(--text-primary)]"><span className="min-w-0 truncate">{typeSummary}</span><ChevronDown className="shrink-0 text-[var(--text-muted)]" aria-hidden /></Button>
    <div className="grid grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] gap-1.5">{ROOM_CHIPS.map((chip) => { const active = draft.rooms.includes(chip.id); return <Button variant="plain" key={chip.id} type="button" onClick={() => onToggleRoom(chip.id)} className={`min-h-11 w-full rounded-lg border px-3 py-2 text-center text-label font-semibold transition ${active ? "border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white" : "border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] text-[var(--text-secondary)]"}`}>{chip.label}</Button>; })}</div>
    <div className="grid grid-cols-1 gap-2"><RangeField from={draft.priceFrom} to={draft.priceTo} onFrom={(value) => setDraft((current) => ({ ...current, priceFrom: value }))} onTo={(value) => setDraft((current) => ({ ...current, priceTo: value }))} fromPlaceholder="от 1,5 млн" toPlaceholder="до 50 млн" inputMode="decimal" numericOnly={false} /><RangeField from={draft.areaFrom} to={draft.areaTo} onFrom={(value) => setDraft((current) => ({ ...current, areaFrom: value }))} onTo={(value) => setDraft((current) => ({ ...current, areaTo: value }))} fromPlaceholder="от 20 м²" toPlaceholder="до 250 м²" /></div>
    {advancedVisible ? <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-panel)] p-3">
      <SmallSelect title="Район" value={draft.district} options={facets.districts} onChange={(district) => setDraft((current) => ({ ...current, district }))} />
      <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3 text-support font-medium text-[var(--text-secondary)]"><Checkbox checked={draft.exclusive} onCheckedChange={(checked) => setDraft((current) => ({ ...current, exclusive: checked === true }))} />Только эксклюзивы</label>
      <SmallSelect title="Тип дома" value={draft.buildingType} options={facets.buildingTypes} onChange={(buildingType) => setDraft((current) => ({ ...current, buildingType }))} />
      <SmallSelect title="Ремонт" value={draft.renovation} options={facets.renovations} onChange={(renovation) => setDraft((current) => ({ ...current, renovation }))} />
      <Button variant="plain" type="button" onClick={onClear} className="inline-flex min-h-10 w-full items-center justify-center rounded-lg text-support font-semibold text-[var(--accent)]">Очистить</Button>
    </div> : null}
    <div className="flex items-center justify-between gap-2 pt-0.5"><div ref={sortRef} className="relative min-w-0"><Button variant="plain" type="button" onClick={() => setSortOpen(!sortOpen)} className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-2.5 text-label font-semibold text-[var(--text-secondary)]" aria-expanded={sortOpen}><ArrowUpDown className="shrink-0 text-[var(--text-muted)]" aria-hidden /><span className="truncate">{sortLabel}</span><ChevronDown className={`size-3.5 shrink-0 text-[var(--text-muted)] transition ${sortOpen ? "rotate-180" : ""}`} aria-hidden /></Button>{sortOpen ? <div className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-50 overflow-hidden rounded-lg border border-[var(--border)] bg-white py-1 shadow-[var(--catalog-mobile-filter-shadow-menu)]">{SORT_OPTIONS.map((option) => { const active = draft.sort === option.value; return <Button variant="plain" key={option.value} type="button" onClick={() => { setDraft((current) => ({ ...current, sort: option.value })); setSortOpen(false); }} className={`flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-support font-medium ${active ? "bg-[var(--surface-card-soft)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}><span>{option.label}</span>{active ? <Check className="text-[var(--accent)]" aria-hidden /> : null}</Button>; })}</div> : null}</div>
      {showAdvancedAlways ? null : <Button variant="plain" type="button" onClick={() => setAdvancedOpen((open) => !open)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-label font-semibold ${advancedOpen ? "border border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white" : "border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] text-[var(--text-secondary)]"}`} aria-expanded={advancedOpen}><SlidersHorizontal className="" aria-hidden />Фильтры</Button>}
    </div>
  </>;
}

function SmallSelect({ title, value, options, onChange }: { title: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="block text-overline font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{title}<Select variant="plain" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3 text-support font-medium normal-case tracking-[0] text-[var(--text-primary)]"><option value="">Любой</option>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></label>;
}

function RangeField({ from, to, onFrom, onTo, fromPlaceholder, toPlaceholder, inputMode = "numeric", numericOnly = true }: { from: string; to: string; onFrom: (value: string) => void; onTo: (value: string) => void; fromPlaceholder: string; toPlaceholder: string; inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"; numericOnly?: boolean }) {
  const normalize = (value: string) => numericOnly ? value.replace(/[^\d]/g, "") : value.replace(/[^\d\s,.мМлЛнНmM]/g, "");
  return <div className="min-w-0"><div className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--catalog-mobile-filter-surface-control)] px-3"><Input variant="plain" inputMode={inputMode} value={from} onChange={(event) => onFrom(normalize(event.target.value))} placeholder={fromPlaceholder} className="min-w-0 flex-1 bg-transparent text-support font-medium tabular-nums text-[var(--text-primary)] outline-none placeholder:text-[var(--catalog-mobile-filter-content-muted)]" /><span className="text-label text-[var(--catalog-mobile-filter-content-muted)]">–</span><Input variant="plain" inputMode={inputMode} value={to} onChange={(event) => onTo(normalize(event.target.value))} placeholder={toPlaceholder} className="min-w-0 flex-1 bg-transparent text-support font-medium tabular-nums text-[var(--text-primary)] outline-none placeholder:text-[var(--catalog-mobile-filter-content-muted)]" /></div></div>;
}
