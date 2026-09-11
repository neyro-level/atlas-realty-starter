import { Input, Select } from "@ams/realty-ui";
import Link from "next/link";
import {
  CatalogEmptyStateView,
  CatalogAdvancedFilterView,
  CatalogRangePairView,
  CatalogSearchFieldView,
  CatalogSelectView,
  CatalogShowcaseView,
  CatalogSortTabsView,
  CatalogViewSwitchView,
  type SiteLinkRendererProps,
} from "@ams/realty-ui";
import {
  buildSearchParams,
  CATALOG_PAGE_SIZE,
  type CatalogQuery,
  type CatalogSnapshot,
  type CatalogView,
} from "@/lib/catalog";
import { filterNewBuildings, type NewBuilding } from "@/modules/new-buildings";
import { tenant } from "@/project/tenant";
import { hasClearableCatalogFilters, listClearableFilterEntries } from "./catalog-filter-clear";
import { CatalogAutoSubmitForm } from "./CatalogAutoSubmitForm";
import { CatalogLoadMore } from "./CatalogLoadMore";
import { CatalogMobileFilter } from "./CatalogMobileFilter";
import { NewBuildingMobileCarousel } from "./NewBuildingMobileCarousel";
import { NewBuildingQuickSelections } from "./NewBuildingQuickSelections";
import { CatalogResidentialComplexCard } from "./CatalogResidentialComplexCard";
import { NewBuildingCatalogMap } from "./NewBuildingCatalogMap";
import {
  FILTER_FIELD_BY_FORM_NAME,
  PUBLIC_FILTER_VALUE_LABELS,
  SORT_TABS,
  TYPE_FILTER_OPTIONS,
  TYPE_TAB_PATHS,
  TYPE_TABS,
  type CatalogFilterId as FilterId,
} from "./catalog-sharp-config";

const PAGE_SIZE = CATALOG_PAGE_SIZE;

type Props = {
  catalog: CatalogSnapshot;
  complexes?: readonly NewBuilding[];
  query?: CatalogQuery;
  paginationQuery?: CatalogQuery;
  initialFilter?: FilterId;
  sectionId?: string;
  basePath?: string;
  headline?: string;
  heading?: string;
  description?: string;
  emptyMessage?: string;
  servicePromo?: "mortgage" | "legal";
  mode?: "default" | "new-buildings";
  defaultView?: CatalogView;
};

function CatalogLinkAdapter({ href, children, ariaLabel, ariaCurrent, scroll, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-label={ariaLabel} aria-current={ariaCurrent} scroll={scroll} {...props}>{children}</Link>;
}

export function CatalogSharpShowcase({
  catalog,
  complexes: availableComplexes = [],
  query = {},
  paginationQuery = query,
  initialFilter = "all",
  sectionId = "page-showcase",
  basePath = "/nedvizhimost",
  headline,
  heading = "Актуальные предложения",
  emptyMessage = "По выбранным параметрам объектов не найдено. Измените фильтры или оставьте заявку на ручной подбор.",
  servicePromo = "mortgage",
  mode = "default",
  defaultView = "grid",
}: Props) {
  const applied = normalizeUiQuery({ ...query, ...catalog.appliedQuery }, defaultView);
  const activeFilter = toFilterId(applied.category) ?? initialFilter;
  const isComplexMode = activeFilter === "new_building";
  const activeView: CatalogView = isComplexMode ? applied.view ?? defaultView : applied.view === "list" ? "list" : "grid";
  const isListView = activeView === "list";
  const isMapView = activeView === "map";
  const complexes = isComplexMode ? filterNewBuildings(availableComplexes, applied) : [];
  const activeSort = applied.sort === "price_asc" || applied.sort === "price_desc" ? applied.sort : "newest";
  const sectionFilter = initialFilter;
  const active = isComplexMode
    ? activeResidentialComplexChips(applied)
    : activeFilterChips(applied, sectionFilter);
  const canClearFilters = isComplexMode
    ? Boolean(applied.q?.trim() || applied.priceFrom || applied.priceTo)
    : hasClearableCatalogFilters(applied, sectionFilter);
  const filterFormKey = buildSearchParams(applied).toString() || "base";

  const resultTotal = isComplexMode ? complexes.length : catalog.total;
  const resultLabel = isComplexMode
    ? `${resultTotal.toLocaleString("ru-RU")} ${pluralizeComplexes(resultTotal)}`
    : `${resultTotal.toLocaleString("ru-RU")} ${pluralizeObjects(resultTotal)}`;

  const tabs = TYPE_TABS.map(([id, label]) => ({ id, label, href: categoryTabHref(basePath, applied, id), active: activeFilter === id }));
  const mobileControls = <>
    <CatalogMobileFilter
      basePath={basePath}
      query={applied}
      catalog={catalog}
      sectionFilter={sectionFilter}
      mode={mode}
      complexFilterIndex={availableComplexes.map((complex) => ({
        search: [complex.name, complex.shortName, complex.location.district, complex.location.address, complex.developer.name].filter(Boolean).join(" "),
        priceFrom: complex.facts.priceFrom,
      }))}
    />
  </>;
  const desktopFilter = isComplexMode
    ? <ResidentialComplexFilterForm key={filterFormKey} basePath={basePath} query={applied} defaultView={defaultView} />
    : <CatalogFilterForm key={filterFormKey} basePath={basePath} query={applied} catalog={catalog} activeFilter={activeFilter} canClearFilters={canClearFilters} />;
  const sorting = isComplexMode ? undefined : <div className="hidden lg:block"><CatalogSortTabsView items={SORT_TABS.map(([id, label]) => ({ id, label, href: catalogHref(basePath, applied, { sort: id }), active: activeSort === id }))} linkRenderer={CatalogLinkAdapter} /></div>;
  const viewItems = ([
    ["grid", "Плитка"],
    ["list", "Список"],
    ...(isComplexMode ? [["map", "Карта"]] : []),
  ] as Array<[CatalogView, string]>).map(([id, label]) => ({ id, label, href: catalogHref(basePath, applied, { view: id }), active: activeView === id }));
  const views = <div className={isComplexMode ? "hidden lg:block" : "hidden md:block"}><CatalogViewSwitchView items={viewItems} linkRenderer={CatalogLinkAdapter} /></div>;

  return (
    <CatalogShowcaseView
      sectionId={sectionId}
      headline={headline}
      heading={heading}
      resultLabel={resultLabel}
      tabs={tabs}
      mobileControls={mobileControls}
      desktopFilter={desktopFilter}
      activeFilters={active}
      clearHref={canClearFilters ? basePath : undefined}
      shownCount={isComplexMode ? complexes.length : catalog.listings.length}
      total={resultTotal}
      sorting={sorting}
      views={views}
      beforeControls={mode === "new-buildings" ? <NewBuildingQuickSelections basePath={basePath} query={applied} complexes={availableComplexes} /> : undefined}
      linkRenderer={CatalogLinkAdapter}
    >
        {isComplexMode ? (
          isMapView ? (
            <NewBuildingCatalogMap complexes={complexes} />
          ) : complexes.length ? (
            <>
              <NewBuildingMobileCarousel complexes={complexes} />
              <div className={isListView ? "mt-4 hidden divide-y divide-[var(--catalog-sharp-showcase-border-01)] border-y border-[var(--catalog-sharp-showcase-border-01)] md:block" : "mt-5 hidden gap-x-5 gap-y-10 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
                {complexes.map((complex, index) => (
                  <CatalogResidentialComplexCard key={complex.slug} complex={complex} variant={activeView} priority={index === 0} />
                ))}
              </div>
            </>
          ) : (
            <CatalogEmptyStateView message="По выбранному запросу жилые комплексы не найдены. Оставьте заявку, и специалист агентства недвижимости уточнит подходящие варианты вручную." linkRenderer={CatalogLinkAdapter} />
          )
        ) : catalog.listings.length ? (
          <div className={isListView ? "mt-4 divide-y divide-[var(--catalog-sharp-showcase-border-01)] border-y border-[var(--catalog-sharp-showcase-border-01)] max-md:!mt-5 max-md:!grid max-md:!grid-cols-1 max-md:!gap-x-5 max-md:!gap-y-7 max-md:!border-0 max-md:!divide-y-0" : "mt-5 grid gap-x-5 gap-y-7 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3 lg:gap-y-12 xl:grid-cols-4"}>
            <CatalogLoadMore
              key={buildSearchParams(applied).toString()}
              basePath={basePath}
              query={applied}
              paginationQuery={paginationQuery}
              initialListings={catalog.listings}
              total={catalog.total}
              variant={activeView}
              servicePromo={servicePromo}
            />
          </div>
        ) : (
          <CatalogEmptyStateView message={emptyMessage} linkRenderer={CatalogLinkAdapter} />
        )}
    </CatalogShowcaseView>
  );
}

function ResidentialComplexFilterForm({ basePath, query, defaultView }: { basePath: string; query: CatalogQuery; defaultView: CatalogView }) {
  return (
    <CatalogAutoSubmitForm action={basePath} className="mt-5">
      <Input unstyled type="hidden" name="city" value={query.city ?? tenant.cityEn} />
      <Input unstyled type="hidden" name="deal_type" value={query.dealType ?? "sale"} />
      <Input unstyled type="hidden" name="category" value="new_building" />
      <Input unstyled type="hidden" name="limit" value={query.limit ?? PAGE_SIZE} />
      <Input unstyled type="hidden" name="view" value={query.view ?? defaultView} />
      <Input unstyled type="hidden" name="sort" value={query.sort ?? "newest"} />

      <div className="grid gap-2 lg:max-w-[820px] lg:grid-cols-[minmax(280px,1.35fr)_minmax(300px,1fr)]">
        <CatalogSearchFieldView defaultValue={query.q} placeholder="Название ЖК, район или застройщик" />
        <CatalogRangePairView from="price_from" to="price_to" label="Цена" fromValue={query.priceFrom} toValue={query.priceTo} />
      </div>
    </CatalogAutoSubmitForm>
  );
}

function CatalogFilterForm({
  basePath,
  query,
  catalog,
  activeFilter,
  canClearFilters,
}: {
  basePath: string;
  query: CatalogQuery;
  catalog: CatalogSnapshot;
  activeFilter: FilterId;
  canClearFilters: boolean;
}) {
  const isLand = query.category === "land";
  const isCommercial = query.category === "commercial";
  const isHouse = query.category === "house";

  return (
    <CatalogAutoSubmitForm action={basePath} className="mt-5">
      <Input unstyled type="hidden" name="city" value={query.city ?? tenant.cityEn} />
      <Input unstyled type="hidden" name="deal_type" value={query.dealType ?? "sale"} />
      <Input unstyled type="hidden" name="limit" value={query.limit ?? PAGE_SIZE} />
      <Input unstyled type="hidden" name="view" value={query.view ?? "grid"} />
      <Input unstyled type="hidden" name="sort" value={query.sort ?? "newest"} />
      {query.category ? <Input unstyled type="hidden" name="category" value={query.category} /> : null}

      <div className="grid gap-2 lg:grid-cols-[minmax(260px,1.4fr)_minmax(150px,0.7fr)_minmax(120px,0.55fr)_minmax(150px,0.7fr)]">
        <CatalogSearchFieldView defaultValue={query.q} placeholder="Район, улица, ЖК или код" />
        <CatalogRangePairView from="price_from" to="price_to" label="Цена" fromValue={query.priceFrom} toValue={query.priceTo} />
        <label className="min-h-12 rounded-lg border border-[var(--border)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Комнаты
          <Select unstyled name="rooms" defaultValue={formatRoomsValue(query.rooms)} className="block w-full bg-transparent pt-0.5 text-sm font-semibold normal-case tracking-[0] text-[var(--text-primary)] outline-none">
            <option value="">Любые</option>
            {catalog.facets.rooms.map((room) => (
              <option key={room.value} value={room.value}>{room.value}</option>
            ))}
          </Select>
        </label>
        {activeFilter === "flat" ? (
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text-secondary)]">
            <Input unstyled name="studio" type="checkbox" value="1" defaultChecked={query.studio === true} className="size-4 accent-[var(--accent)]" />
            Студия
          </label>
        ) : null}
        <CatalogRangePairView from="area_from" to="area_to" label="Площадь" fromValue={query.areaFrom} toValue={query.areaTo} />
      </div>

      <CatalogAdvancedFilterView>
          {select("district", query.district, catalog.facets.districts, "Район / квартал")}
          {!isLand ? <CatalogRangePairView from="floor_from" to="floor_to" label={isHouse ? "Этажность" : "Этаж"} fromValue={query.floorFrom} toValue={query.floorTo} /> : null}
          {activeFilter === "all" ? select("category", query.category, [...TYPE_FILTER_OPTIONS], "Тип объекта") : null}
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text-secondary)]">
            <Input unstyled
              name="exclusive"
              type="checkbox"
              value="1"
              defaultChecked={query.exclusive === true}
              className="size-4 accent-[var(--accent)]"
            />
            Только эксклюзивы
          </label>
          {isLand ? (
            <>
              <CatalogRangePairView from="lot_area_from" to="lot_area_to" label="Участок" fromValue={query.lotAreaFrom} toValue={query.lotAreaTo} />
              {select("land_use_type", query.landUseType, catalog.facets.landUseTypes, "Назначение")}
              <CheckboxGroup
                items={[
                  ["electricity", "Электричество", query.hasElectricity],
                  ["gas", "Газ", query.hasGas],
                  ["water", "Вода", query.hasWater],
                  ["sewerage", "Канализация", query.hasSewerage],
                ]}
              />
            </>
          ) : isCommercial ? (
            <>
              {select("commercial_type", query.commercialType, catalog.facets.commercialTypes, "Тип объекта")}
              {select("commercial_building_type", query.commercialBuildingType, catalog.facets.commercialBuildingTypes, "Тип здания")}
              {select("entrance_type", query.entranceType, catalog.facets.entranceTypes, "Тип входа")}
            </>
          ) : (
            <>
              {select("building_type", query.buildingType, catalog.facets.buildingTypes, "Тип дома")}
              {select("renovation", query.renovation, catalog.facets.renovations, "Ремонт / состояние")}
            </>
          )}
          {canClearFilters ? (
            <div className="flex items-end">
              <Link
                href={basePath}
                scroll={false}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-[var(--accent)]"
              >
                Очистить
              </Link>
            </div>
          ) : null}
      </CatalogAdvancedFilterView>
    </CatalogAutoSubmitForm>
  );
}

function CheckboxGroup({ items }: { items: Array<[string, string, boolean | undefined]> }) {
  return (
    <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-white p-3 text-sm font-semibold text-[var(--text-secondary)]">
      {items.map(([name, label, checked]) => (
        <label key={name} className="flex items-center gap-2">
          <Input unstyled name={name} type="checkbox" value="1" defaultChecked={checked} className="size-4 accent-[var(--accent)]" />
          {label}
        </label>
      ))}
    </div>
  );
}

function select(
  name: string,
  value: string | undefined,
  options: Array<{ value: string; label: string }>,
  title: string,
) {
  return <CatalogSelectView name={name} value={value} title={title} options={options.map((item) => ({ value: item.value, label: publicSelectOptionLabel(name, item) }))} />;
}

function catalogHref(basePath: string, query: CatalogQuery, updates: Partial<CatalogQuery>) {
  const nextQuery = normalizeUiQuery({
    ...query,
    ...updates,
    page: updates.page ?? undefined,
    limit: query.limit ?? PAGE_SIZE,
  });
  if ("category" in updates && updates.category === undefined) delete nextQuery.category;
  if (updates.page === undefined) delete nextQuery.page;
  const params = buildSearchParams(nextQuery);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function categoryTabHref(basePath: string, query: CatalogQuery, category: FilterId) {
  const targetPath = TYPE_TAB_PATHS[category];
  const portableQuery = buildPortableTabQuery(query);

  if (targetPath !== basePath) {
    return catalogHref(targetPath, portableQuery, {});
  }

  return catalogHref(basePath, portableQuery, category === "all" ? { category: undefined } : { category });
}

function buildPortableTabQuery(query: CatalogQuery): CatalogQuery {
  return {
    city: query.city,
    dealType: query.dealType,
    q: query.q,
    sort: query.sort,
    view: query.view,
  };
}

function normalizeUiQuery(query: CatalogQuery, defaultView: CatalogView = "grid"): CatalogQuery {
  return {
    ...query,
    sort: query.sort === "price_asc" || query.sort === "price_desc" ? query.sort : "newest",
    view: query.view === "grid" || query.view === "list" || query.view === "map" ? query.view : defaultView,
    limit: query.limit ?? PAGE_SIZE,
  };
}

function toFilterId(category?: string): FilterId | null {
  if (category === "flat" || category === "house" || category === "land" || category === "commercial" || category === "new_building" || category === "construction") return category;
  return null;
}

function formatRoomsValue(value: CatalogQuery["rooms"]) {
  if (Array.isArray(value)) return value.join("|");
  return value ? String(value) : "";
}

function pluralizeComplexes(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return "жилой комплекс";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "жилых комплекса";
  return "жилых комплексов";
}

function activeResidentialComplexChips(query: CatalogQuery) {
  const chips: string[] = [];
  if (query.q) chips.push(`Поиск: ${query.q}`);
  if (query.priceFrom) chips.push(`Цена от: ${query.priceFrom.toLocaleString("ru-RU")} ₽`);
  if (query.priceTo) chips.push(`Цена до: ${query.priceTo.toLocaleString("ru-RU")} ₽`);
  return chips;
}

function pluralizeObjects(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return "объект";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объекта";
  return "объектов";
}

function activeFilterChips(query: CatalogQuery, sectionFilter: FilterId = "all") {
  return listClearableFilterEntries(query, sectionFilter).map(
    ([key, value]) => `${labelFor(key)}: ${formatFilterValue(key, value)}`,
  );
}

function publicSelectOptionLabel(name: string, item: { value: string; label: string }) {
  const key = FILTER_FIELD_BY_FORM_NAME[name] ?? name;
  if (hasCyrillic(item.label) && item.label !== item.value) return item.label;
  return formatFilterValue(key, item.value);
}

function formatFilterValue(key: string, value: unknown) {
  if (value === true) return "да";
  if (typeof value === "number") return value.toLocaleString("ru-RU");
  if (typeof value !== "string") return String(value);

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  return PUBLIC_FILTER_VALUE_LABELS[key]?.[trimmed] ?? humanizeFilterValue(trimmed);
}

function humanizeFilterValue(value: string) {
  if (hasCyrillic(value)) return value;

  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function hasCyrillic(value: string) {
  return /[а-яё]/i.test(value);
}

function labelFor(key: string) {
  return ({
    q: "Поиск",
    category: "Тип",
    district: "Район",
    rooms: "Комнаты",
    studio: "Студия",
    exclusive: "Эксклюзивы",
    priceFrom: "Цена от",
    priceTo: "Цена до",
    areaFrom: "Площадь от",
    areaTo: "Площадь до",
    lotAreaFrom: "Участок от",
    lotAreaTo: "Участок до",
    buildingType: "Тип дома",
    renovation: "Ремонт",
    landUseType: "Назначение",
    commercialType: "Тип",
    commercialBuildingType: "Здание",
    entranceType: "Вход",
    hasElectricity: "Электричество",
    hasGas: "Газ",
    hasWater: "Вода",
    hasSewerage: "Канализация",
  } as Record<string, string>)[key] ?? key;
}
