"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sameOriginFetch } from "@/core/security/outbound-http/browser";
import { CatalogMobileFilterView, type MobileRoomId, type MobileTypeId } from "@starter/site-ui";
import type { CatalogQuery, CatalogSnapshot } from "@/lib/catalog";
import { consumeOpenCatalogFiltersIntent, OPEN_CATALOG_FILTERS_EVENT } from "./catalog-sticky-chrome";
import {
  createMobileFilterDraft,
  formatMobileTypeSummary,
  pluralizeShowLabel,
  resolveMobileApplyTarget,
  type MobileFilterDraft,
} from "./catalog-mobile-filter-model";

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
] as const;

type Props = { basePath: string; query: CatalogQuery; catalog: CatalogSnapshot; sectionFilter: string; complexSearchIndex?: readonly string[] };

export function CatalogMobileFilter({ basePath, query, catalog, sectionFilter, complexSearchIndex = [] }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState<MobileFilterDraft>(() => createMobileFilterDraft(query, sectionFilter));
  const [typeOpen, setTypeOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [previewTotal, setPreviewTotal] = useState(catalog.total);
  const [counting, setCounting] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const querySyncKey = useMemo(() => JSON.stringify({ query, sectionFilter, total: catalog.total }), [query, sectionFilter, catalog.total]);
  const [appliedQuerySyncKey, setAppliedQuerySyncKey] = useState(querySyncKey);
  if (appliedQuerySyncKey !== querySyncKey) {
    setAppliedQuerySyncKey(querySyncKey);
    setDraft(createMobileFilterDraft(query, sectionFilter));
    setPreviewTotal(catalog.total);
  }

  useEffect(() => {
    function openFilters() { setFiltersSheetOpen(true); setTypeOpen(false); setSortOpen(false); setAdvancedOpen(false); }
    window.addEventListener(OPEN_CATALOG_FILTERS_EVENT, openFilters);
    if (consumeOpenCatalogFiltersIntent()) openFilters();
    return () => window.removeEventListener(OPEN_CATALOG_FILTERS_EVENT, openFilters);
  }, []);

  useEffect(() => {
    if (!sortOpen) return;
    function closeOutside(event: MouseEvent) { if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false); }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [sortOpen]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const { path, query: nextQuery } = resolveMobileApplyTarget(draft);
    let cancelled = false;
    if (path === "/novostroyki") {
      const needle = draft.q.trim().toLowerCase();
      const total = needle ? complexSearchIndex.filter((value) => value.toLowerCase().includes(needle)).length : complexSearchIndex.length;
      queueMicrotask(() => { if (!cancelled) setPreviewTotal(total); });
      return () => { cancelled = true; };
    }
    const params = buildApiParams(nextQuery);
    queueMicrotask(() => { if (!cancelled) setCounting(true); });
    const timer = window.setTimeout(async () => {
      try {
        const response = await sameOriginFetch(`/api/showcase/listings?${params}`);
        if (!response.ok) return;
        const payload = (await response.json()) as { meta?: { total?: number } };
        if (!cancelled && typeof payload.meta?.total === "number") setPreviewTotal(payload.meta.total);
      } catch { /* keep the last known total */ }
      finally { if (!cancelled) setCounting(false); }
    }, 350);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [complexSearchIndex, draft]);

  function toggleType(id: MobileTypeId) {
    setDraft((current) => { const selected = new Set(current.types); if (selected.has(id)) selected.delete(id); else selected.add(id); return { ...current, types: Array.from(selected) as MobileTypeId[] }; });
  }
  function toggleRoom(id: MobileRoomId) {
    setDraft((current) => { const selected = new Set(current.rooms); if (selected.has(id)) selected.delete(id); else selected.add(id); return { ...current, rooms: Array.from(selected) as MobileFilterDraft["rooms"] }; });
  }
  function applyFilters() {
    const { path, query: nextQuery } = resolveMobileApplyTarget({ ...draft, view: "grid", sort: draft.sort === "price_asc" || draft.sort === "price_desc" ? draft.sort : "newest" });
    const params = buildRouteParams(nextQuery);
    startTransition(() => router.push(params ? `${path}?${params}` : path, { scroll: false }));
    setTypeOpen(false); setSortOpen(false); setFiltersSheetOpen(false);
  }
  function clearDraft() {
    startTransition(() => router.push(basePath, { scroll: false }));
    setTypeOpen(false); setAdvancedOpen(false); setSortOpen(false);
  }

  const typeSummary = useMemo(() => formatMobileTypeSummary(draft.types), [draft.types]);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === draft.sort)?.label ?? "Сначала новые";
  return <CatalogMobileFilterView
    draft={draft}
    setDraft={setDraft}
    facets={catalog.facets}
    typeSummary={typeSummary}
    sortLabel={sortLabel}
    sortOpen={sortOpen}
    setSortOpen={setSortOpen}
    sortRef={sortRef}
    advancedOpen={advancedOpen}
    setAdvancedOpen={setAdvancedOpen}
    filtersSheetOpen={filtersSheetOpen}
    setFiltersSheetOpen={setFiltersSheetOpen}
    typeOpen={typeOpen}
    setTypeOpen={setTypeOpen}
    onToggleType={toggleType}
    onToggleRoom={toggleRoom}
    onClear={clearDraft}
    onApply={applyFilters}
    applyLabel={counting ? "Считаем…" : pluralizeShowLabel(previewTotal)}
  />;
}

function addQueryParams(params: URLSearchParams, query: CatalogQuery) {
  if (query.q) params.set("q", query.q); if (query.city) params.set("city", query.city); if (query.district) params.set("district", query.district); if (query.category) params.set("category", query.category); if (query.dealType) params.set("deal_type", query.dealType);
  if (query.priceFrom) params.set("price_from", String(query.priceFrom)); if (query.priceTo) params.set("price_to", String(query.priceTo)); if (query.areaFrom) params.set("area_from", String(query.areaFrom)); if (query.areaTo) params.set("area_to", String(query.areaTo));
  if (query.studio) params.set("studio", "1"); if (query.exclusive) params.set("exclusive", "1");
  if (Array.isArray(query.rooms)) params.set("rooms", query.rooms.join("|")); else if (typeof query.rooms === "number") params.set("rooms", String(query.rooms));
  if (query.buildingType) params.set("building_type", query.buildingType); if (query.renovation) params.set("renovation", query.renovation); if (query.sort) params.set("sort", query.sort);
}
function buildApiParams(query: CatalogQuery) { const params = new URLSearchParams(); addQueryParams(params, query); params.set("limit", "1"); return params.toString(); }
function buildRouteParams(query: CatalogQuery) { const params = new URLSearchParams(); addQueryParams(params, query); params.set("view", "grid"); if (query.limit) params.set("limit", String(query.limit)); return params.toString(); }
