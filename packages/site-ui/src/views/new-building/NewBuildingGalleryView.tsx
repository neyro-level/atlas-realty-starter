"use client";

import { Button } from "../../components/ui/button";
import type { NewBuildingMediaViewModel } from "../../contracts/new-building";
import type { SiteImageRenderer } from "../../lib/adapters";
import { useState } from "react";
import { Building2, Camera, ExternalLink, MapPin, Play } from "lucide-react";
import { MediaGallery } from "../property/MediaGallery";

export type NewBuildingGalleryViewProps = {
  address: string;
  images: NewBuildingMediaViewModel[];
  mapUrl: string;
  mapWidgetUrl: string;
  name: string;
  videoUrl?: string | null;
  imageRenderer: SiteImageRenderer;
};

type TabKey = "photos" | "video" | "map";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Camera }> = [
  { key: "photos", label: "Фотографии", icon: Camera },
  { key: "video", label: "Видео", icon: Play },
  { key: "map", label: "На карте", icon: MapPin },
];

export function NewBuildingGalleryView({
  address,
  images,
  mapUrl,
  mapWidgetUrl,
  name,
  videoUrl,
  imageRenderer: Image,
}: NewBuildingGalleryViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("photos");
  const vkEmbedSrc = buildVkEmbedSrc(videoUrl);

  return (
    <div className="grid h-98 grid-rows-[minmax(0,1fr)_44px] gap-2 md:h-127.5 lg:h-160">
      <div className="relative min-h-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
        {activeTab === "photos" ? (
          <MediaGallery
            images={images.flatMap((image) => image.src ? [{ src: image.src, alt: image.alt }] : [])}
            imageRenderer={Image}
            imageSizes="(max-width: 639px) calc(100vw - 24px), (max-width: 1024px) calc(100vw - 40px), 890px"
            priority
            variant="light-controls"
            emptyLabel="Изображение ЖК готовится к публикации"
            emptyContent={<NewBuildingMediaPlaceholder />}
          />
        ) : null}

        {activeTab === "video" ? (
          vkEmbedSrc ? (
            <iframe
              src={vkEmbedSrc}
              title={`Видео жилого комплекса: ${name}`}
              loading="lazy"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <VideoPlaceholder />
          )
        ) : null}

        {activeTab === "map" ? (
          <MapPanel
            address={address}
            name={name}
            widgetUrl={mapWidgetUrl}
            yandexUrl={mapUrl}
          />
        ) : null}
      </div>

      <div className="grid min-h-0 grid-cols-3 gap-2" role="tablist" aria-label="Медиа жилого комплекса">
        {TABS.map(({ key, label, icon: Icon }) => (
          <Button variant="plain"
            type="button"
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-label font-semibold transition sm:text-body ${
              activeTab === key
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--surface-card-soft)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            }`}
          >
            <Icon className="shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function MapPanel({
  address,
  name,
  widgetUrl,
  yandexUrl,
}: {
  address: string;
  name: string;
  widgetUrl: string;
  yandexUrl: string;
}) {
  return (
    <div className="relative h-full w-full">
      <iframe
        src={widgetUrl}
        title={`Расположение: ${name}`}
        // Tab-mounted iframes must not use loading="lazy": browsers often never fetch them.
        allowFullScreen
        className="h-full w-full border-0"
      />
      <MapExternalLink href={yandexUrl} />
      <span className="sr-only">{address}</span>
    </div>
  );
}

function MapExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--surface-card)] px-3 text-label font-semibold text-[var(--text-primary)] shadow-[var(--new-building-gallery-shadow-control)] transition hover:text-[var(--accent)] max-md:bottom-2 max-md:right-2"
    >
      <MapPin className="size-3.5" aria-hidden />
      Открыть на карте
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

function VideoPlaceholder() {
  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_18%_18%,var(--surface)_0%,var(--accent-soft)_30%,transparent_58%),linear-gradient(135deg,var(--new-building-gallery-surface-soft)_0%,var(--surface-card-soft)_48%,var(--surface)_100%)] p-6 text-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 420" aria-hidden>
        <defs>
          <linearGradient id="new-building-video-room-gradient" x1="158" x2="562" y1="122" y2="298" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--surface)" />
            <stop offset="0.55" stopColor="var(--accent-soft)" />
            <stop offset="1" stopColor="var(--new-building-gallery-surface-soft)" />
          </linearGradient>
          <filter id="new-building-video-placeholder-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="var(--text-primary)" floodOpacity="0.12" />
          </filter>
        </defs>
        <path d="M74 328C128 220 170 115 295 106c82-6 124 36 193 11 54-20 92-58 139-27 54 35 37 121 8 179-42 84-121 116-243 121-145 6-256-9-318-62Z" fill="var(--accent)" opacity="0.055" />
        <g filter="url(#new-building-video-placeholder-shadow)">
          <path d="M122 82H598V338H122z" fill="var(--surface)" stroke="var(--surface)" strokeWidth="12" />
          <path d="M150 112H570V306H150z" fill="url(#new-building-video-room-gradient)" stroke="var(--new-building-gallery-border)" strokeWidth="2" />
          <path d="M150 112h420v194H150z" fill="var(--surface)" opacity="0.22" />
          <path d="M183 155h124v86H183z" fill="var(--surface)" fillOpacity="0.58" stroke="var(--border)" strokeWidth="2" />
          <path d="M404 147h108v106H404z" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
          <path d="M176 269h368" stroke="var(--input)" strokeWidth="3" />
          <path d="M222 269c18-33 59-33 78 0M421 269c22-37 68-37 91 0" fill="none" stroke="var(--accent)" strokeOpacity="0.16" strokeWidth="12" strokeLinecap="round" />
          <path d="M208 180h74M208 205h44M429 176h58M429 199h44M330 167h60M318 234h84" stroke="var(--input)" strokeWidth="4" strokeLinecap="round" />
          <path d="M330 174l48 27-48 27v-54Z" fill="var(--accent)" fillOpacity="0.78" />
        </g>
      </svg>
      <div className="relative self-end pb-8 max-md:pb-5">
        <p className="rounded-lg border border-white/70 bg-[var(--surface-card)]/88 px-5 py-3 text-body-large font-semibold leading-tight-copy text-[var(--text-primary)] shadow-[var(--new-building-gallery-shadow-caption)] backdrop-blur-sm max-md:px-4 max-md:py-2.5 max-md:text-body">
          Видео жилого комплекса не загружено
        </p>
      </div>
    </div>
  );
}

function NewBuildingMediaPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[var(--new-building-gallery-surface-inverse)] px-6 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,var(--new-building-gallery-accent-glow),transparent_35%),linear-gradient(var(--new-building-gallery-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--new-building-gallery-grid-line)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px]" />
      <span className="relative flex size-16 items-center justify-center rounded-lg border border-white/14 bg-[var(--surface-card)]/8"><Building2 className="size-8 text-[var(--new-building-gallery-accent-content)]" aria-hidden /></span>
      <p className="relative mt-5 text-body font-extrabold">Изображение ЖК готовится к публикации</p>
      <p className="relative mt-2 max-w-xs text-label leading-step-body text-white/58">Покажем только проверенные материалы проекта</p>
    </div>
  );
}

function buildVkEmbedSrc(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  const directMatch = decodeURIComponent(trimmed).match(/video(-?\d+)_(\d+)/);
  const url = toUrl(trimmed);

  if (!url || !isVkVideoHost(url.hostname)) return null;

  if (url.pathname.endsWith("/video_ext.php")) {
    const oid = safeVkNumber(url.searchParams.get("oid"));
    const id = safeVkNumber(url.searchParams.get("id"));
    const hash = safeVkHash(url.searchParams.get("hash"));
    if (!oid || !id) return null;

    return buildVkPlayerUrl(oid, id, hash);
  }

  if (directMatch) {
    return buildVkPlayerUrl(directMatch[1], directMatch[2], null);
  }

  const zMatch = decodeURIComponent(url.searchParams.get("z") ?? "").match(/video(-?\d+)_(\d+)/);
  if (zMatch) {
    return buildVkPlayerUrl(zMatch[1], zMatch[2], null);
  }

  return null;
}

function buildVkPlayerUrl(oid: string, id: string, hash: string | null) {
  const params = new URLSearchParams({ oid, id, hd: "2" });
  if (hash) params.set("hash", hash);
  return `https://vk.com/video_ext.php?${params.toString()}`;
}

function toUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isVkVideoHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "vk.com" || normalized.endsWith(".vk.com") || normalized === "vkvideo.ru" || normalized.endsWith(".vkvideo.ru");
}

function safeVkNumber(value: string | null) {
  return value && /^-?\d+$/.test(value) ? value : null;
}

function safeVkHash(value: string | null) {
  return value && /^[a-z0-9_-]+$/i.test(value) ? value : null;
}
