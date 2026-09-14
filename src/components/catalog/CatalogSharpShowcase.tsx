import { Checkbox, formatRussianCount, Input, Select } from "@starter/site-ui/primitives";
import Link from "next/link";
import { type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { CatalogEmptyStateView, CatalogAdvancedFilterView, CatalogRangePairView, CatalogSearchFieldView, CatalogSelectView, CatalogShowcaseView, CatalogSortTabsView, CatalogViewSwitchView } from "@starter/site-ui/views";
import {
  buildSearchParams,
  CATALOG_PAGE_SIZE,
  type CatalogQuery,
  type CatalogSnapshot,
  type CatalogView,
} from "@/lib/catalog";
import { filterNewBuildings, type NewBuilding } from "@/modules/new-buildings";
import { tenant } from "@/project/tenant.config";
import { clientEnv } from "@/project/public-env";
import { siteProfile } from "@/project/tenant.config";
import { hasClearableCatalogFilters } from "./catalog-filter-clear";
import { CatalogAutoSubmitForm } from "./CatalogAutoSubmitForm";
import { CatalogLoadMore } from "./CatalogLoadMore";
import { CatalogMobileFilter } from "./CatalogMobileFilter";
import { NewBuildingMobileCarousel } from "./NewBuildingMobileCarousel";
import { NewBuildingQuickSelections } from "./NewBuildingQuickSelections";
import { CatalogResidentialComplexCard } from "./CatalogResidentialComplexCard";
import { NewBuildingCatalogMap } from "./NewBuildingCatalogMap";
import {
  SORT_TABS,
  TYPE_FILTER_OPTIONS,
  TYPE_TABS,
  type CatalogFilterId as FilterId,
} from "./catalog-sharp-config";
import {
  activeFilterChips,
  activeResidentialComplexChips,
  catalogHref,
  categoryTabHref,
  formatRoomsValue,
  normalizeUiQuery,
  publicSelectOptionLabel,
  toFilterId,
} from "./catalog-showcase-model";

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
  mode?: "default" | "main-catalog" | "new-buildings";
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
    ? formatRussianCount(resultTotal, ["жилой комплекс", "жилых комплекса", "жилых комплексов"])
    : formatRussianCount(resultTotal, ["объект", "объекта", "объектов"]);

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
            <NewBuildingCatalogMap
              complexes={complexes}
              config={{
                apiKey: clientEnv.yandexMapsApiKey,
                center: siteProfile.map.center,
                catalogZoom: siteProfile.map.catalogZoom,
                cityName: tenant.cityRu,
                cityGenitive: siteProfile.city.genitive,
              }}
            />
          ) : complexes.length ? (
            <>
              <NewBuildingMobileCarousel complexes={complexes} />
              <div className={isListView ? "mt-4 hidden divide-y divide-[var(--catalog-sharp-showcase-border-divider)] border-y border-[var(--catalog-sharp-showcase-border-divider)] md:block" : "mt-5 hidden gap-x-5 gap-y-10 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
                {complexes.map((complex, index) => (
                  <CatalogResidentialComplexCard key={complex.slug} complex={complex} variant={activeView} priority={index === 0} />
                ))}
              </div>
            </>
          ) : (
            <CatalogEmptyStateView message="По выбранному запросу жилые комплексы не найдены. Оставьте заявку, и специалист агентства недвижимости уточнит подходящие варианты вручную." linkRenderer={CatalogLinkAdapter} />
          )
        ) : catalog.listings.length ? (
          <div className={isListView ? "mt-4 divide-y divide-[var(--catalog-sharp-showcase-border-divider)] border-y border-[var(--catalog-sharp-showcase-border-divider)] max-md:!mt-5 max-md:!grid max-md:!grid-cols-1 max-md:!gap-x-5 max-md:!gap-y-7 max-md:!border-0 max-md:!divide-y-0" : "mt-5 grid gap-x-5 gap-y-7 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3 lg:gap-y-12 xl:grid-cols-4"}>
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
      <Input variant="plain" type="hidden" name="city" value={query.city ?? tenant.cityEn} />
      <Input variant="plain" type="hidden" name="deal_type" value={query.dealType ?? "sale"} />
      <Input variant="plain" type="hidden" name="category" value="new_building" />
      <Input variant="plain" type="hidden" name="limit" value={query.limit ?? PAGE_SIZE} />
      <Input variant="plain" type="hidden" name="view" value={query.view ?? defaultView} />
      <Input variant="plain" type="hidden" name="sort" value={query.sort ?? "newest"} />

      <div className="grid gap-2 lg:max-w-205 lg:grid-cols-[minmax(280px,1.35fr)_minmax(300px,1fr)]">
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
      <Input variant="plain" type="hidden" name="city" value={query.city ?? tenant.cityEn} />
      <Input variant="plain" type="hidden" name="deal_type" value={query.dealType ?? "sale"} />
      <Input variant="plain" type="hidden" name="limit" value={query.limit ?? PAGE_SIZE} />
      <Input variant="plain" type="hidden" name="view" value={query.view ?? "grid"} />
      <Input variant="plain" type="hidden" name="sort" value={query.sort ?? "newest"} />
      {query.category ? <Input variant="plain" type="hidden" name="category" value={query.category} /> : null}

      <div className="grid gap-2 lg:grid-cols-[minmax(260px,1.4fr)_minmax(150px,0.7fr)_minmax(120px,0.55fr)_minmax(150px,0.7fr)]">
        <CatalogSearchFieldView defaultValue={query.q} placeholder="Район, улица, ЖК или код" />
        <CatalogRangePairView from="price_from" to="price_to" label="Цена" fromValue={query.priceFrom} toValue={query.priceTo} />
        <label className="min-h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1 text-caption font-bold uppercase tracking-overline-compact text-[var(--text-muted)]">
          Комнаты
          <Select variant="native" name="rooms" defaultValue={formatRoomsValue(query.rooms)} className="block w-full bg-transparent pt-0.5 text-body font-semibold normal-case tracking-body text-[var(--text-primary)] outline-none">
            <option value="">Любые</option>
            {catalog.facets.rooms.map((room) => (
              <option key={room.value} value={room.value}>{room.value}</option>
            ))}
          </Select>
        </label>
        {activeFilter === "flat" ? (
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-body font-semibold text-[var(--text-secondary)]">
            <Checkbox name="studio" value="1" defaultChecked={query.studio === true} />
            Студия
          </label>
        ) : null}
        <CatalogRangePairView from="area_from" to="area_to" label="Площадь" fromValue={query.areaFrom} toValue={query.areaTo} />
      </div>

      <CatalogAdvancedFilterView>
          {select("district", query.district, catalog.facets.districts, "Район / квартал")}
          {!isLand ? <CatalogRangePairView from="floor_from" to="floor_to" label={isHouse ? "Этажность" : "Этаж"} fromValue={query.floorFrom} toValue={query.floorTo} /> : null}
          {activeFilter === "all" ? select("category", query.category, [...TYPE_FILTER_OPTIONS], "Тип объекта") : null}
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] px-3 text-body font-semibold text-[var(--text-secondary)]">
            <Checkbox
              name="exclusive"
              value="1"
              defaultChecked={query.exclusive === true}
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
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-body font-bold text-[var(--accent)]"
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
    <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-3 text-body font-semibold text-[var(--text-secondary)]">
      {items.map(([name, label, checked]) => (
        <label key={name} className="flex items-center gap-2">
          <Checkbox name={name} value="1" defaultChecked={checked} />
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
