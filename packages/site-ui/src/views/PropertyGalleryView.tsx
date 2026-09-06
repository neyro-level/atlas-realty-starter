"use client";

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Play,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteImageRenderer } from "../lib/adapters";

export type PropertyGalleryViewProps = {
  images: string[];
  videoUrl?: string | null;
  videoUrls?: string[];
  imageAlt: string;
  address: string;
  mapUrl: string;
  imageRenderer: SiteImageRenderer;
  shouldOptimizeImage?: (src: string) => boolean;
};

type TabKey = "photos" | "video" | "map";
type LightboxImage = {
  src: string;
  alt: string;
};

const TABS: Array<{ key: TabKey; label: string; icon: typeof Camera }> = [
  { key: "photos", label: "Фотографии", icon: Camera },
  { key: "video", label: "Видео", icon: Play },
  { key: "map", label: "На карте", icon: MapPin },
];

export function PropertyGalleryView({
  images,
  videoUrl,
  videoUrls,
  imageAlt,
  address,
  mapUrl,
  imageRenderer: ImageRenderer,
  shouldOptimizeImage = () => false,
}: PropertyGalleryViewProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const safeVideoUrls = useMemo(
    () => [...new Set((videoUrls?.length ? videoUrls : videoUrl ? [videoUrl] : []).filter(Boolean))],
    [videoUrl, videoUrls],
  );
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const activeVideoUrl = safeVideoUrls[Math.min(activeVideoIndex, Math.max(safeVideoUrls.length - 1, 0))];
  const videoEmbedSrc = useMemo(() => buildVideoEmbedSrc(activeVideoUrl), [activeVideoUrl]);
  const [activeTab, setActiveTab] = useState<TabKey>("photos");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const suppressTapOpen = useRef(false);
  const safeIndex = safeImages.length > 0 ? Math.min(activeIndex, safeImages.length - 1) : 0;
  const currentImage = safeImages[safeIndex];
  const canNavigate = safeImages.length > 1;

  useEffect(() => {
    if (!lightboxImage) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxImage(null);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxImage]);

  function goPrevious() {
    setActiveIndex((current) => (current === 0 ? safeImages.length - 1 : current - 1));
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % safeImages.length);
  }

  function handlePhotoTouchStart(event: React.TouchEvent<HTMLButtonElement>) {
    if (!canNavigate) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchCurrentX.current = touchStartX.current;
    suppressTapOpen.current = false;
  }

  function handlePhotoTouchMove(event: React.TouchEvent<HTMLButtonElement>) {
    if (!canNavigate || touchStartX.current === null) return;
    touchCurrentX.current = event.touches[0]?.clientX ?? touchCurrentX.current;
  }

  function handlePhotoTouchEnd() {
    if (!canNavigate || touchStartX.current === null || touchCurrentX.current === null) {
      touchStartX.current = null;
      touchCurrentX.current = null;
      return;
    }

    const deltaX = touchCurrentX.current - touchStartX.current;
    const swipeThreshold = 42;
    const tapThreshold = 10;

    if (Math.abs(deltaX) > tapThreshold) {
      suppressTapOpen.current = true;
    }

    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrevious();
      }
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
  }

  function handlePhotoOpen() {
    if (suppressTapOpen.current) {
      suppressTapOpen.current = false;
      return;
    }

    if (currentImage) {
      setLightboxImage({ src: currentImage, alt: imageAlt });
    }
  }

  return (
    <div className="grid h-[392px] grid-rows-[minmax(0,1fr)_50px] gap-2 md:h-[510px] md:grid-rows-[minmax(0,1fr)_52px] lg:h-[640px] lg:gap-3 lg:rounded-lg lg:border lg:border-[var(--border)] lg:bg-white lg:p-3 lg:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_42px_rgba(23,22,26,0.08)]">
      <div className="relative min-h-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
        {activeTab === "photos" ? (
          <PhotosPanel
            canNavigate={canNavigate}
            currentImage={currentImage}
            imageAlt={imageAlt}
            activeIndex={safeIndex}
            imageCount={safeImages.length}
            onOpenLightbox={handlePhotoOpen}
            onPrevious={goPrevious}
            onNext={goNext}
            onTouchStart={handlePhotoTouchStart}
            onTouchMove={handlePhotoTouchMove}
            onTouchEnd={handlePhotoTouchEnd}
            imageRenderer={ImageRenderer}
            shouldOptimizeImage={shouldOptimizeImage}
          />
        ) : null}

        {activeTab === "video" ? (
          videoEmbedSrc ? (
            <div className="relative size-full">
              <iframe
                src={videoEmbedSrc}
                title={`Видео объекта: ${imageAlt}`}
                loading="lazy"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                allowFullScreen
                className="h-full w-full border-0"
              />
              {safeVideoUrls.length > 1 ? <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-[15px] bg-[var(--surface-dark)]/80 p-1.5 backdrop-blur-sm">{safeVideoUrls.map((url, index) => <button key={url} type="button" onClick={() => setActiveVideoIndex(index)} className={`min-h-9 rounded-[10px] px-3 text-xs font-semibold transition ${index === activeVideoIndex ? "bg-white text-[var(--text-primary)]" : "text-white hover:bg-white/15"}`}>{videoProviderLabel(url)}</button>)}</div> : null}
            </div>
          ) : (
            <MediaPlaceholder title="Видео объекта не загружено" />
          )
        ) : null}

        {activeTab === "map" ? (
          <div className="relative h-full w-full">
            <iframe
              src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(`Краснодар, ${address}`)}&z=16`}
              title={`Расположение: ${address}`}
              allowFullScreen
              className="h-full w-full border-0"
            />
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="map_open"
              data-analytics-context="property_gallery_map"
              className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[var(--text-primary)] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:text-[var(--accent)] max-md:bottom-2 max-md:right-2"
            >
              <MapPin className="size-3.5" aria-hidden />
              Открыть на карте
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        ) : null}
      </div>

      <div className="grid min-h-0 w-full grid-cols-3 gap-2" role="tablist" aria-label="Медиа объекта">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            type="button"
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex min-h-[36px] items-center justify-center gap-1.25 rounded-[12px] border px-2 text-[11px] font-semibold transition md:min-h-[38px] ${
              activeTab === key
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--surface-card-soft)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            }`}
          >
            <Icon className="size-[13px] shrink-0 md:size-[14px]" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {lightboxImage ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[var(--surface-dark-strong)]/92 p-16 max-md:p-4" role="dialog" aria-modal="true" aria-label="Медиа объекта">
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-lg border border-white/70 bg-[var(--surface-dark)]/76 text-white"
            aria-label="Закрыть просмотр"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="relative h-[82vh] w-full max-w-[1120px]">
            <ImageRenderer
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              fill
              unoptimized={!shouldOptimizeImage(lightboxImage.src)}
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PhotosPanel({
  canNavigate,
  currentImage,
  imageAlt,
  activeIndex,
  imageCount,
  onOpenLightbox,
  onPrevious,
  onNext,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  imageRenderer: ImageRenderer,
  shouldOptimizeImage,
}: {
  canNavigate: boolean;
  currentImage?: string;
  imageAlt: string;
  activeIndex: number;
  imageCount: number;
  onOpenLightbox: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onTouchStart: (event: React.TouchEvent<HTMLButtonElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLButtonElement>) => void;
  onTouchEnd: () => void;
  imageRenderer: SiteImageRenderer;
  shouldOptimizeImage: (src: string) => boolean;
}) {
  if (!currentImage) {
    return (
      <div className="grid h-full place-items-center text-sm font-semibold text-[var(--text-muted)]">
        Фото объекта уточняется
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onOpenLightbox}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 [touch-action:pan-y]"
        aria-label="Открыть фото на весь экран"
      >
        <ImageRenderer
          src={currentImage}
          alt={imageAlt}
          fill
          priority
          unoptimized={!shouldOptimizeImage(currentImage)}
          sizes="(min-width: 1180px) calc(var(--site-frame-max) - 372px), 100vw"
          className="object-cover"
        />
        {canNavigate ? (
          <span className="absolute left-3 top-3 rounded-lg bg-[var(--surface-dark)]/82 px-3 py-1.5 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">
            {activeIndex + 1} / {imageCount}
          </span>
        ) : null}
      </button>

      {canNavigate ? (
        <>
          <button
            type="button"
            onClick={onPrevious}
            className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/70 bg-[var(--surface-dark)]/76 text-white transition hover:bg-[var(--surface-dark)]"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/70 bg-[var(--surface-dark)]/76 text-white transition hover:bg-[var(--surface-dark)]"
            aria-label="Следующее фото"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      ) : null}
    </>
  );
}

function MediaPlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_18%_18%,var(--surface)_0%,var(--accent-soft)_30%,transparent_58%),linear-gradient(135deg,#F1EEEE_0%,var(--surface-card-soft)_48%,var(--surface)_100%)] p-6 text-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 420" aria-hidden>
        <defs>
          <linearGradient id="object-video-room-gradient" x1="158" x2="562" y1="122" y2="298" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--surface)" />
            <stop offset="0.55" stopColor="var(--accent-soft)" />
            <stop offset="1" stopColor="#F1EEEE" />
          </linearGradient>
          <filter id="object-video-placeholder-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="var(--text-primary)" floodOpacity="0.12" />
          </filter>
        </defs>
        <path d="M74 328C128 220 170 115 295 106c82-6 124 36 193 11 54-20 92-58 139-27 54 35 37 121 8 179-42 84-121 116-243 121-145 6-256-9-318-62Z" fill="var(--accent)" opacity="0.055" />
        <g filter="url(#object-video-placeholder-shadow)">
          <path d="M122 82H598V338H122z" fill="var(--surface)" stroke="var(--surface)" strokeWidth="12" />
          <path d="M150 112H570V306H150z" fill="url(#object-video-room-gradient)" stroke="#D8D6D3" strokeWidth="2" />
          <path d="M150 112h420v194H150z" fill="var(--surface)" opacity="0.22" />
          <path d="M183 155h124v86H183z" fill="var(--surface)" fillOpacity="0.58" stroke="var(--border)" strokeWidth="2" />
          <path d="M404 147h108v106H404z" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
          <path d="M176 269h368" stroke="#D0D0CD" strokeWidth="3" />
          <path d="M222 269c18-33 59-33 78 0M421 269c22-37 68-37 91 0" fill="none" stroke="var(--accent)" strokeOpacity="0.16" strokeWidth="12" strokeLinecap="round" />
          <path d="M208 180h74M208 205h44M429 176h58M429 199h44M330 167h60M318 234h84" stroke="#D0D0CD" strokeWidth="4" strokeLinecap="round" />
          <path d="M330 174l48 27-48 27v-54Z" fill="var(--accent)" fillOpacity="0.78" />
        </g>
      </svg>
      <div className="relative self-end pb-8 max-md:pb-5">
        <p className="rounded-lg border border-white/70 bg-white/88 px-5 py-3 text-base font-semibold leading-tight text-[var(--text-primary)] shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-sm max-md:px-4 max-md:py-2.5 max-md:text-sm">
          {title}
        </p>
      </div>
    </div>
  );
}

function buildVideoEmbedSrc(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  const url = toUrl(trimmed);
  if (!url || url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (host === "rutube.ru") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "video" ? parts[1] : null;
    return id && /^[A-Za-z0-9_-]+$/.test(id) ? `https://rutube.ru/play/embed/${id}` : null;
  }

  const directMatch = decodeURIComponent(trimmed).match(/video(-?\d+)_(\d+)/);

  if (!isVkVideoHost(url.hostname)) return null;

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

function videoProviderLabel(value: string) {
  const url = toUrl(value);
  return url?.hostname.toLowerCase().includes("rutube") ? "Rutube" : "VK Видео";
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
