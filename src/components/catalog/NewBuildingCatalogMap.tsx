"use client";

import { Button, CatalogMapFrameView } from "@ams/realty-ui";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type HTMLAttributes } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { newBuildingHref, type NewBuilding } from "@/modules/new-buildings";
import { tenant } from "@/project/tenant";
import { clientEnv } from "@/project/public-env";
import { siteProfile } from "@/project/site-profile";
import { getMappableNewBuildings } from "./new-building-catalog-map-model";

type YandexMap = {
  destroy: () => void;
  setCenter: (coordinates: [number, number], zoom?: number) => void;
  geoObjects: { add: (placemark: YandexPlacemark) => void };
};
type YandexPlacemark = { events: { add: (event: "click", callback: () => void) => void } };
type YandexMapsApi = {
  ready: (callback: () => void) => void;
  Map: new (element: HTMLElement, state: { center: [number, number]; zoom: number }, options?: Record<string, unknown>) => YandexMap;
  Placemark: new (coordinates: [number, number], properties: Record<string, unknown>, options?: Record<string, unknown>) => YandexPlacemark;
};

declare global {
  interface Window {
    ymaps?: YandexMapsApi;
  }
}

const MAP_SCRIPT_ID = "agency-yandex-maps-api";
export function NewBuildingCatalogMap({ complexes }: { complexes: NewBuilding[] }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);
  const mappableComplexes = useMemo(() => getMappableNewBuildings(complexes), [complexes]);
  const reviewRequiredCount = complexes.length - mappableComplexes.length;
  const [selectedSlug, setSelectedSlug] = useState(complexes[0]?.slug ?? null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const element = mapElementRef.current;
    const apiKey = clientEnv.yandexMapsApiKey;
    if (!element || !apiKey || !mappableComplexes.length) {
      setStatus("unavailable");
      return;
    }

    let cancelled = false;
    const availabilityTimer = window.setTimeout(() => {
      if (!cancelled) setStatus("unavailable");
    }, 12_000);
    const initMap = () => {
      const ymaps = window.ymaps;
      if (!ymaps || cancelled) return;

      ymaps.ready(() => {
        if (cancelled || !mapElementRef.current) return;
        const map = new ymaps.Map(mapElementRef.current, { center: [...siteProfile.map.center], zoom: siteProfile.map.catalogZoom }, { suppressMapOpenBlock: true });
        window.clearTimeout(availabilityTimer);
        mapRef.current = map;

        mappableComplexes.forEach((complex) => {
          const placemark = new ymaps.Placemark(
            [complex.location.latitude, complex.location.longitude],
            { balloonContentHeader: complex.name, balloonContentBody: complex.location.address ?? complex.location.district ?? tenant.cityRu },
            { preset: "islands#redHomeIcon" },
          );
          placemark.events.add("click", () => setSelectedSlug(complex.slug));
          map.geoObjects.add(placemark);
        });

        setStatus("ready");
      });
    };

    if (window.ymaps) {
      initMap();
    } else {
      const script = document.getElementById(MAP_SCRIPT_ID) as HTMLScriptElement | null;
      const mapScript = script ?? document.createElement("script");
      if (!script) {
        mapScript.id = MAP_SCRIPT_ID;
        mapScript.async = true;
        mapScript.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
        document.head.appendChild(mapScript);
      }
      mapScript.addEventListener("load", initMap, { once: true });
      mapScript.addEventListener("error", () => setStatus("unavailable"), { once: true });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(availabilityTimer);
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [mappableComplexes]);

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
                className={`min-w-[254px] rounded-xl border bg-white px-3.5 py-3 text-left shadow-[var(--new-building-map-shadow-card)] transition duration-200 lg:min-w-0 ${
                  selected ? "border-[var(--accent)] shadow-[var(--new-building-map-shadow-selected)]" : "border-[var(--border)] hover:-translate-y-0.5 hover:border-[var(--new-building-map-border-hover)] hover:shadow-[var(--new-building-map-shadow-hover)]"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <MapPin className={`mt-0.5 size-4 shrink-0 ${mapped ? "text-[var(--accent)]" : "text-[var(--new-building-map-content-muted)]"}`} aria-hidden />
                  <span className="min-w-0">
                    <span className="block line-clamp-2 text-sm font-bold leading-5 text-[var(--text-primary)]">{complex.name}</span>
                    <span className="mt-1.5 block line-clamp-1 text-xs leading-4 text-[var(--new-building-map-content-default)]">{complex.location.district ?? complex.location.address ?? "Адрес уточняется"}</span>
                    <span className="mt-2.5 block text-sm font-extrabold text-[var(--text-primary)]">{complex.facts.priceFrom ? `от ${formatPrice(complex.facts.priceFrom)}` : "Цена уточняется"}</span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      }
      canvas={<div ref={mapElementRef} data-testid="new-building-map-canvas" className="absolute inset-0" aria-label={`Карта жилых комплексов ${siteProfile.city.genitive}`} />}
      statusMessage={status === "ready" ? null : status === "loading" ? "Загружаем карту жилых комплексов..." : "Карта временно недоступна. Выберите ЖК из списка слева."}
      action={selectedComplex ? (
          <Link href={newBuildingHref(selectedComplex)} className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-[var(--text-primary)] shadow-[var(--new-building-map-shadow-floating)] transition hover:text-[var(--accent)]">
            Открыть выбранный ЖК
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        ) : null}
    />
  );
}
