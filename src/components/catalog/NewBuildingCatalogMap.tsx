"use client";

import { Button } from "@starter/site-ui/primitives";
import { CatalogMapFrameView } from "@starter/site-ui/views";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type HTMLAttributes } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { createYandexMapAdapter } from "@/core/integrations/maps/yandex-maps";
import type { MapAdapter } from "@/core/integrations/maps/types";
import { formatPrice } from "@/lib/catalog";
import { newBuildingHref, type NewBuilding } from "@/modules/new-buildings";
import { canInitializeCatalogMap, getMappableNewBuildings } from "./new-building-catalog-map-model";

export type NewBuildingMapPublicConfig = {
  apiKey: string | null | undefined;
  center: readonly [number, number];
  catalogZoom: number;
  cityName: string;
  cityGenitive: string;
};

export function NewBuildingCatalogMap({ complexes, config }: { complexes: NewBuilding[]; config: NewBuildingMapPublicConfig }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapAdapter | null>(null);
  const mappableComplexes = useMemo(() => getMappableNewBuildings(complexes), [complexes]);
  const reviewRequiredCount = complexes.length - mappableComplexes.length;
  const [selectedSlug, setSelectedSlug] = useState(complexes[0]?.slug ?? null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const element = mapElementRef.current;
    const apiKey = config.apiKey;
    if (!element || !canInitializeCatalogMap(apiKey, mappableComplexes.length)) {
      setStatus("unavailable");
      return;
    }

    let cancelled = false;
    const adapter = createYandexMapAdapter({ apiKey, onPointClick: setSelectedSlug });
    mapRef.current = adapter;
    adapter.addPoints(mappableComplexes.map((complex) => ({
      body: complex.location.address ?? complex.location.district ?? config.cityName,
      coordinates: [complex.location.latitude, complex.location.longitude],
      id: complex.slug,
      title: complex.name,
    })));
    void adapter.init(element, config.center, config.catalogZoom)
      .then(() => { if (!cancelled) setStatus("ready"); })
      .catch(() => { if (!cancelled) setStatus("unavailable"); });

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [config, mappableComplexes]);

  function selectComplex(complex: NewBuilding) {
    setSelectedSlug(complex.slug);
    if (complex.location.latitude !== null && complex.location.longitude !== null) {
      mapRef.current?.setCenter([complex.location.latitude, complex.location.longitude], 15);
    }
  }

  const selectedComplex = complexes.find((complex) => complex.slug === selectedSlug) ?? complexes[0];

  return (
    <CatalogMapFrameView
      testId="new-building-catalog-map"
      rootProps={{ "data-map-status": status, "data-map-points": mappableComplexes.length, "data-map-review-required": reviewRequiredCount } as HTMLAttributes<HTMLDivElement>}
      sidebar={
        <div data-testid="new-building-map-list" className="flex gap-3 overflow-x-auto px-0.5 pb-2 pt-0.5 lg:grid lg:gap-3 lg:overflow-visible">
          {reviewRequiredCount > 0 ? <p className="sr-only">Объекты без координат требуют ручной проверки: {reviewRequiredCount}</p> : null}
          {complexes.map((complex) => {
            const selected = complex.slug === selectedSlug;
            const mapped = complex.location.latitude !== null && complex.location.longitude !== null;
            return (
              <Button variant="plain"
                key={complex.slug}
                type="button"
                onClick={() => selectComplex(complex)}
                className={`min-w-63.5 rounded-xl border bg-[var(--surface-card)] px-3.5 py-3 text-left shadow-[var(--new-building-map-shadow-card)] transition duration-200 lg:min-w-0 ${
                  selected ? "border-[var(--accent)] shadow-[var(--new-building-map-shadow-selected)]" : "border-[var(--border)] hover:-translate-y-0.5 hover:border-[var(--new-building-map-border-hover)] hover:shadow-[var(--new-building-map-shadow-hover)]"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <MapPin className={`mt-0.5 size-4 shrink-0 ${mapped ? "text-[var(--accent)]" : "text-[var(--new-building-map-content-muted)]"}`} aria-hidden />
                  <span className="min-w-0">
                    <span className="block line-clamp-2 text-body font-bold leading-step-body text-[var(--text-primary)]">{complex.name}</span>
                    <span className="mt-1.5 block line-clamp-1 text-label leading-step-small text-[var(--new-building-map-content-default)]">{complex.location.district ?? complex.location.address ?? "Адрес уточняется"}</span>
                    <span className="mt-2.5 block text-body font-extrabold text-[var(--text-primary)]">{complex.facts.priceFrom ? `от ${formatPrice(complex.facts.priceFrom)}` : "Цена уточняется"}</span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      }
      canvas={<div ref={mapElementRef} data-testid="new-building-map-canvas" className="absolute inset-0" aria-label={`Карта жилых комплексов ${config.cityGenitive}`} />}
      statusMessage={status === "ready" ? null : <p role="status" aria-live="polite">{status === "loading" ? "Загружаем карту жилых комплексов..." : "Карта временно недоступна. Выберите ЖК из списка слева."}</p>}
      action={selectedComplex ? (
          <Link href={newBuildingHref(selectedComplex)} className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--surface-card)] px-3 text-label font-bold text-[var(--text-primary)] shadow-[var(--new-building-map-shadow-floating)] transition hover:text-[var(--accent)]">
            Открыть выбранный ЖК
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        ) : null}
    />
  );
}
