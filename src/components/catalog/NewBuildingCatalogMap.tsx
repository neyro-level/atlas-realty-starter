"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { newBuildingHref, type NewBuilding } from "@/modules/new-buildings";
import { tenant } from "@/project/tenant";
import { clientEnv } from "@/project/public-env";
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
const city_CENTER: [number, number] = [48.574, 39.307];

export function NewBuildingCatalogMap({ complexes }: { complexes: NewBuilding[] }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);
  const mappableComplexes = useMemo(() => getMappableNewBuildings(complexes), [complexes]);
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
    const initMap = () => {
      const ymaps = window.ymaps;
      if (!ymaps || cancelled) return;

      ymaps.ready(() => {
        if (cancelled || !mapElementRef.current) return;
        const map = new ymaps.Map(mapElementRef.current, { center: city_CENTER, zoom: 12 }, { suppressMapOpenBlock: true });
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
    <div
      data-testid="new-building-catalog-map"
      data-map-status={status}
      data-map-points={mappableComplexes.length}
      className="mt-5 flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white lg:grid lg:h-[640px] lg:grid-cols-[340px_minmax(0,1fr)]"
    >
      <aside className="order-2 border-t border-[var(--border)] bg-white p-3 lg:order-1 lg:overflow-y-auto lg:border-r lg:border-t-0 lg:p-4">
        <div data-testid="new-building-map-list" className="flex gap-3 overflow-x-auto px-0.5 pb-2 pt-0.5 lg:grid lg:gap-3 lg:overflow-visible">
          {complexes.map((complex) => {
            const selected = complex.slug === selectedSlug;
            const mapped = complex.location.latitude !== null && complex.location.longitude !== null;
            return (
              <button
                key={complex.slug}
                type="button"
                onClick={() => selectComplex(complex)}
                className={`min-w-[254px] rounded-xl border bg-white px-3.5 py-3 text-left shadow-[0_6px_20px_rgba(23,22,26,0.05)] transition duration-200 lg:min-w-0 ${
                  selected ? "border-[var(--accent)] shadow-[0_10px_24px_rgba(138,21,21,0.12)]" : "border-[var(--border)] hover:-translate-y-0.5 hover:border-[var(--palette-b45a5a)] hover:shadow-[0_10px_24px_rgba(23,22,26,0.08)]"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <MapPin className={`mt-0.5 size-4 shrink-0 ${mapped ? "text-[var(--accent)]" : "text-[var(--palette-aaa7a8)]"}`} aria-hidden />
                  <span className="min-w-0">
                    <span className="block line-clamp-2 text-sm font-bold leading-5 text-[var(--text-primary)]">{complex.name}</span>
                    <span className="mt-1.5 block line-clamp-1 text-xs leading-4 text-[var(--palette-777477)]">{complex.location.district ?? complex.location.address ?? "Адрес уточняется"}</span>
                    <span className="mt-2.5 block text-sm font-extrabold text-[var(--text-primary)]">{complex.facts.priceFrom ? `от ${formatPrice(complex.facts.priceFrom)}` : "Цена уточняется"}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="order-1 relative min-h-[420px] bg-[var(--surface-muted)] lg:order-2 lg:min-h-0">
        <div ref={mapElementRef} data-testid="new-building-map-canvas" className="absolute inset-0" aria-label="Карта жилых комплексов Краснодара" />
        {status !== "ready" ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-semibold text-[var(--palette-5e5b5e)]">
            {status === "loading" ? "Загружаем карту жилых комплексов..." : "Карта временно недоступна. Выберите ЖК из списка слева."}
          </div>
        ) : null}
        {selectedComplex ? (
          <Link href={newBuildingHref(selectedComplex)} className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-[var(--text-primary)] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:text-[var(--accent)]">
            Открыть выбранный ЖК
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
