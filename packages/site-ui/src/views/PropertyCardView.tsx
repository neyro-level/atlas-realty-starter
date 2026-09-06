"use client";

import type { PropertyCardDto } from "@starter/site-contracts";
import { useMemo, useRef, useState, type MouseEvent, type ReactNode, type TouchEvent } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";

export type PropertyCardViewProps = {
  listing: PropertyCardDto;
  variant?: CatalogView;
  /** First visible cards: preload cover for faster paint. */
  priority?: boolean;
  /** Override card link (session collections may store non-property paths). */
  href: string;
  /** Optional compact label over the cover image. */
  imageBadge?: string;
  cardKind?: "property" | "new-building" | "construction";
  cityName?: string;
  phone: string;
  phoneHref: string;
  addressParts?: {
    visiblePrefix: string | null;
    hiddenHousePart: string | null;
  };
  renderCollectionAction?: (props: PropertyCardCollectionActionProps) => ReactNode;
  imageRenderer: SiteImageRenderer;
  linkRenderer: SiteLinkRenderer;
  shouldOptimizeImage?: (src: string) => boolean;
  onOpenChat?: () => void;
};

export type PropertyCardCollectionActionProps = {
  kind: "favorites" | "compare";
  className: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export type CatalogView = "grid" | "list" | "map";

export function PropertyCardView({
  listing,
  variant = "grid",
  priority = false,
  href: path,
  imageBadge,
  cardKind = listing.categoryKey === "construction" ? "construction" : "property",
  cityName,
  phone,
  phoneHref,
  addressParts: suppliedAddressParts,
  renderCollectionAction,
  imageRenderer: ImageRenderer,
  linkRenderer: LinkRenderer,
  shouldOptimizeImage = () => false,
  onOpenChat,
}: PropertyCardViewProps) {
  const images = useMemo(() => {
    const list = listing.images.length ? listing.images : listing.image ? [listing.image] : [];
    return [...new Set(list)].filter(Boolean);
  }, [listing.image, listing.images]);
  const [activeImage, setActiveImage] = useState(0);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentImage = images[activeImage];
  /** Exclusive badge comes from XML overlay membership or a manual exclusive contract. */
  const showExclusiveBadge = Boolean(listing.isExclusive);
  const title = buildPropertyCardTitle(listing, cardKind);
  const listTitle = buildPropertyCardListTitle(listing, cardKind);
  const displayAddress = cleanPropertyCardDisplayAddress(listing.address);
  const addressParts = suppliedAddressParts ?? { visiblePrefix: displayAddress, hiddenHousePart: null };
  const priceLabel = formatCardPrice(listing, cardKind);
  const isList = variant === "list";
  const listingDate = formatListingDate(listing.lastModified);
  const objectCode = listing.objectCode?.trim() || null;
  const isNewBuildingCard = cardKind === "new-building";
  const isXmlCatalogCard = cardKind === "property";
  const showsPropertyIdentity = ["flat", "house", "land", "commercial"].includes(listing.categoryKey);
  const displayObjectId = showsPropertyIdentity ? objectCode ?? listing.id : null;
  const listDescription = cleanListingDescription(
    listing.description,
    objectCode ?? listing.id,
  );
  function stop(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function openPropertyChat(event: MouseEvent<HTMLElement>) {
    stop(event);
    onOpenChat?.();
  }

  function showPrevious(event: MouseEvent<HTMLButtonElement>) {
    stop(event);
    setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext(event: MouseEvent<HTMLButtonElement>) {
    stop(event);
    setActiveImage((current) => (current + 1) % images.length);
  }

  function onGalleryTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function onGalleryTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const touchStart = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!touchStart || !touch) return;

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) < 28 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) {
      setActiveImage((current) => (current + 1) % images.length);
      return;
    }

    setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  if (isList) {
    return (
      <article
        className="group relative grid cursor-pointer gap-5 bg-transparent p-4 transition duration-300 hover:relative hover:z-10 hover:rounded-lg hover:bg-[var(--surface-card-soft)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.02),0_22px_52px_rgba(0,0,0,0.10)] md:grid-cols-[300px_minmax(0,1fr)_230px] md:px-0 md:py-6"
      >
        <LinkRenderer
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          ariaLabel={`Открыть объект в новой вкладке: ${title}`}
          className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          <span className="sr-only">{title}</span>
        </LinkRenderer>

        <div
          className="relative z-20 h-[238px] touch-pan-y select-none overflow-hidden rounded-lg bg-[var(--surface-muted)] sm:h-[280px] md:h-[288px]"
          onTouchStart={onGalleryTouchStart}
          onTouchEnd={onGalleryTouchEnd}
        >
          {currentImage ? (
            <ImageRenderer
              src={currentImage}
              alt={listing.title}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              quality={75}
              unoptimized={!shouldOptimizeImage(currentImage)}
              sizes="(max-width: 767px) calc(100vw - 32px), 300px"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[var(--text-muted)]">
              <Building2 className="size-8" aria-hidden />
            </span>
          )}

          <CatalogBadgeStack objectId={displayObjectId} imageBadge={imageBadge} className="left-3 top-3" />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[var(--surface-dark)]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:left-3 lg:size-9 lg:bg-[var(--surface-dark)]/62 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="size-5 lg:size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[var(--surface-dark)]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:right-3 lg:size-9 lg:bg-[var(--surface-dark)]/62 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Следующее фото"
              >
                <ChevronRight className="size-5 lg:size-5" aria-hidden />
              </button>
              <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1" aria-hidden>
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1 rounded-full transition-all ${
                      index === activeImage ? "w-5 bg-white/95" : "w-2.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <span className="absolute bottom-3 right-3 z-20 inline-flex min-h-7 items-center gap-1 rounded-full bg-[var(--surface-dark)]/72 px-2.5 text-[10px] font-bold tabular-nums text-white shadow-[0_5px_14px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                <ImageIcon className="size-3.5" aria-hidden />
                {activeImage + 1}/{images.length}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex min-h-[238px] flex-col md:min-h-[288px]">
          <div className="min-w-0">
            <h3 className="text-[1.15rem] font-extrabold leading-6 tracking-[-0.01em] text-[var(--text-primary)]">
              {listTitle}
            </h3>
            <div className="mt-2 space-y-1.5 text-sm leading-5 tracking-[0.01em] text-[var(--text-muted)]">
              {listing.district && listing.district !== cityName ? (
                <p className="font-semibold text-[var(--accent)]">{listing.district}</p>
              ) : null}
              <p className="flex min-w-0 items-center gap-1.5 text-[15.4px] leading-[22px] text-[var(--text-secondary)] lg:text-sm lg:leading-5">
                <MapPin className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                <AddressLine visiblePrefix={addressParts.visiblePrefix} hiddenHousePart={addressParts.hiddenHousePart} />
              </p>
            </div>
          </div>

          {listDescription ? (
            <p className="mt-8 line-clamp-3 text-sm leading-6 tracking-[0.01em] text-[var(--text-primary)] md:mt-9">
              {listDescription}
            </p>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
            {phoneVisible ? (
              <a
                href={phoneHref}
                onClick={stop}
                data-analytics-context="catalog_property_card"
                data-analytics-item={listing.slug}
                className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--surface-dark)] px-5 text-center text-[15.4px] font-semibold tabular-nums text-white transition hover:bg-[#2A292C] lg:text-sm sm:min-w-[190px]"
              >
                <Phone className="size-[17.6px] lg:size-4" aria-hidden />
                {phone}
              </a>
            ) : (
              <button
                type="button"
                data-analytics-event="phone_reveal"
                data-analytics-context="catalog_property_card"
                data-analytics-item={listing.slug}
                onClick={(event) => {
                  stop(event);
                  setPhoneVisible(true);
                }}
                className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--surface-dark)] px-5 text-center text-[15.4px] font-semibold text-white transition hover:bg-[#2A292C] lg:text-sm sm:min-w-[190px]"
              >
                <Phone className="size-[17.6px] lg:size-4" aria-hidden />
                Показать телефон
              </button>
            )}
            <button
              type="button"
              onClick={openPropertyChat}
              className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] px-5 text-center text-[15.4px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:text-sm sm:min-w-[130px]"
            >
              <MessageCircle className="size-[17.6px] lg:size-4" aria-hidden />
              Написать
            </button>
          </div>
        </div>

        <div className={`flex min-h-[238px] flex-col justify-between gap-4 md:min-h-[288px] ${isNewBuildingCard || isXmlCatalogCard ? "md:pr-6" : ""}`}>
          <div className={isNewBuildingCard ? "flex flex-col items-end gap-4 pt-1" : "flex items-start justify-between gap-4 md:justify-end"}>
            <div data-catalog-price-row className="flex min-w-0 items-center gap-2 md:justify-end">
              <p className="text-[1.2rem] font-extrabold leading-none tabular-nums tracking-[-0.01em] text-[var(--text-primary)]">
                {priceLabel}
              </p>
              {showExclusiveBadge ? <ExclusiveBadge /> : null}
            </div>

            <div className={`relative z-20 flex shrink-0 flex-row gap-2 ${isNewBuildingCard ? "" : "md:flex-col"}`}>
              {renderCollectionAction?.({
                kind: "compare",
                className: "flex size-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]",
              })}
              {renderCollectionAction?.({
                kind: "favorites",
                className: "flex size-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]",
              })}
            </div>
          </div>

          {listingDate ? (
            <p className="hidden text-right text-xs font-medium leading-5 text-[var(--text-muted)] md:block">{listingDate}</p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative cursor-pointer rounded-lg bg-white/0 transition duration-300 ${
        isList
          ? "grid overflow-hidden border border-[var(--border)] bg-white shadow-none hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.02),0_20px_48px_rgba(0,0,0,0.08)] md:grid-cols-[320px_minmax(0,1fr)_210px]"
          : "-m-2 overflow-visible border border-transparent p-2 shadow-[0_1px_2px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.035)] transition-shadow lg:shadow-none hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_42px_rgba(0,0,0,0.08)]"
      }`}
    >
      <LinkRenderer
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        ariaLabel={`Открыть объект в новой вкладке: ${title}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <span className="sr-only">{title}</span>
      </LinkRenderer>

      <div className={isList ? "p-3 md:pr-0" : ""}>
        <div
          className={`relative z-20 touch-pan-y select-none overflow-hidden rounded-lg bg-[var(--surface-muted)] ${isList ? "aspect-[16/10] md:h-full md:min-h-[214px]" : "aspect-[3/2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition duration-300 group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.09)]"}`}
          onTouchStart={onGalleryTouchStart}
          onTouchEnd={onGalleryTouchEnd}
        >
          {currentImage ? (
            <ImageRenderer
              src={currentImage}
              alt={listing.title}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              quality={75}
              unoptimized={!shouldOptimizeImage(currentImage)}
              sizes={isList
                ? "(max-width: 767px) calc(100vw - 32px), 280px"
                : "(max-width: 639px) calc(100vw - 40px), (max-width: 1279px) 50vw, 25vw"}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[var(--text-muted)]">
              <Building2 className="size-8" aria-hidden />
            </span>
          )}

          <CatalogBadgeStack objectId={displayObjectId} imageBadge={imageBadge} className="left-2.5 top-2.5" />
          <div
            className={`absolute right-2.5 top-2.5 z-20 ${isNewBuildingCard || isXmlCatalogCard ? "" : "lg:hidden"}`}
            onClick={stop}
          >
            {renderCollectionAction?.({
              kind: "favorites",
              className: "flex size-9 items-center justify-center rounded-lg transition [&_svg]:!size-4",
              inactiveClassName: "bg-[var(--surface-card-soft)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
              activeClassName: "bg-[var(--accent-soft)] text-[var(--accent)]",
            })}
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[var(--surface-dark)]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:left-3 lg:size-9 lg:bg-[var(--surface-dark)]/62 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[var(--surface-dark)]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:right-3 lg:size-9 lg:bg-[var(--surface-dark)]/62 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Следующее фото"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>

              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent px-2.5 pb-2.5 pt-10 lg:hidden" />

              <div
                className="pointer-events-none absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-[3px]"
                aria-hidden
                data-gallery-bars
              >
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`h-px rounded-full transition-opacity ${
                      index === activeImage ? "w-3.5 bg-white/90" : "w-2.5 bg-white/35"
                    }`}
                  />
                ))}
              </div>

              <span className="absolute bottom-2.5 right-2.5 z-20 inline-flex min-h-6 items-center gap-1 rounded-md bg-[var(--surface-dark)]/66 px-2 text-[10px] font-bold tabular-nums text-white shadow-[0_5px_14px_rgba(0,0,0,0.10)] backdrop-blur-sm">
                <ImageIcon className="size-3" aria-hidden />
                {activeImage + 1}/{images.length}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className={isList ? "p-4 md:p-5" : "pb-3 pt-3 md:pb-0 md:pt-2.5"}>
        <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-x-2 gap-y-1.5 lg:block">
          <div data-catalog-price-row className="flex min-w-0 items-center justify-between gap-2 pr-1 lg:pr-0">
            <p className="min-w-0 text-[1.19rem] font-extrabold leading-none tabular-nums tracking-[-0.01em] text-[var(--text-primary)] md:text-[1.32rem] lg:text-[1.28rem]">{priceLabel}</p>
            {showExclusiveBadge ? <ExclusiveBadge /> : null}
          </div>
          <div className="relative z-20 row-span-3 flex w-10 shrink-0 flex-col items-center gap-[7px] self-start justify-start lg:hidden" onClick={stop}>
            <div className="flex w-10 flex-col items-center gap-[7px]">
              <a
                href={phoneHref}
                aria-label={`Позвонить: ${phone}`}
                data-analytics-context="catalog_property_card_call"
                data-analytics-item={listing.slug}
                className="inline-flex size-10 items-center justify-center rounded-lg bg-[var(--surface-card-soft)] text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                <Phone className="size-[18.7px]" strokeWidth={1.85} aria-hidden />
              </a>
              <button
                type="button"
                onClick={openPropertyChat}
                aria-label="Открыть чат"
                className="inline-flex size-10 items-center justify-center rounded-lg bg-[var(--surface-card-soft)] text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                <MessageCircle className="size-[18.7px]" strokeWidth={1.85} aria-hidden />
              </button>
            </div>
          </div>
          {!isNewBuildingCard && !isXmlCatalogCard ? (
            <div className="relative z-20 hidden items-center justify-end gap-1.5 lg:flex" onClick={stop}>
              {renderCollectionAction?.({
                kind: "compare",
                className: "flex size-10 items-center justify-center rounded-lg transition",
                inactiveClassName: "bg-[var(--surface-card-soft)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
                activeClassName: "bg-[var(--accent-soft)] text-[var(--accent)]",
              })}
              {renderCollectionAction?.({
                kind: "favorites",
                className: "flex size-10 items-center justify-center rounded-lg transition",
                inactiveClassName: "bg-[var(--surface-card-soft)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
                activeClassName: "bg-[var(--accent-soft)] text-[var(--accent)]",
              })}
            </div>
          ) : null}
          <h3 className="line-clamp-2 rounded-md text-[0.9rem] font-extrabold leading-[1.2] tracking-[-0.01em] text-[var(--text-primary)] transition-colors group-active:text-[var(--accent)] md:text-[0.99rem] md:leading-[1.32rem] lg:mt-2 lg:text-[0.98rem] lg:leading-5 lg:group-hover:text-[var(--accent)]">
          {title}
          </h3>
          <div className="text-[10.45px] leading-[1.16rem] tracking-[0.01em] text-[var(--text-muted)] md:text-[11px] md:leading-[1.19rem] lg:mt-2 lg:text-xs lg:leading-5">
          <p className="flex min-w-0 items-center gap-1 font-semibold text-[var(--text-secondary)] md:gap-1.5">
            <MapPin className="size-3 shrink-0 text-[var(--accent)] md:size-3.5" aria-hidden />
            <AddressLine visiblePrefix={addressParts.visiblePrefix} hiddenHousePart={addressParts.hiddenHousePart} compact />
          </p>
          </div>
        </div>
        {isList && listing.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 tracking-[0.01em] text-[var(--text-secondary)]">{listing.description}</p>
        ) : null}
        {isList ? <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{listing.category} · база агентства недвижимости</p> : null}
      </div>

      {isList ? (
        <div className="grid content-end gap-2 p-4 md:border-l md:border-[var(--border)] md:p-5">
          {phoneVisible ? (
            <a
                href={phoneHref}
                onClick={stop}
                data-analytics-context="catalog_property_card"
                data-analytics-item={listing.slug}
                className="relative z-20 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 text-center text-sm font-bold tabular-nums text-white transition hover:bg-[var(--accent-hover)]"
              >
              <Phone className="size-4" aria-hidden />
              {phone}
            </a>
          ) : (
            <button
              type="button"
                data-analytics-event="phone_reveal"
                data-analytics-context="catalog_property_card"
                data-analytics-item={listing.slug}
                onClick={(event) => {
                  stop(event);
                  setPhoneVisible(true);
                }}
                className="relative z-20 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 text-center text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
              >
              <Phone className="size-4" aria-hidden />
              Показать телефон
            </button>
          )}
          <button
            type="button"
            onClick={openPropertyChat}
            className="relative z-20 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 text-center text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <MessageCircle className="size-4" aria-hidden />
            Написать
          </button>
        </div>
      ) : null}
    </article>
  );
}

function CatalogBadgeStack({ objectId, imageBadge, className }: { objectId: string | null; imageBadge?: string; className: string }) {
  if (!objectId && !imageBadge) return null;

  return (
    <div data-catalog-badge-stack className={`absolute z-10 flex flex-col items-start gap-1.5 ${className}`}>
      {imageBadge ? (
        <span data-sales-leader-badge className="inline-flex min-h-6 items-center rounded-md bg-[var(--accent)] px-2.5 text-[10px] font-bold leading-none text-white shadow-[0_5px_14px_rgba(138,21,21,0.20)]">
          {imageBadge}
        </span>
      ) : null}
      {objectId ? (
        <span
          data-catalog-object-code={objectId}
          className="inline-flex min-h-6 max-w-[168px] items-center truncate rounded-md bg-white/94 px-2 text-[10px] font-medium leading-none tabular-nums text-[var(--text-primary)] shadow-[0_5px_14px_rgba(0,0,0,0.07)] backdrop-blur-sm"
          title={`ID объекта: ${objectId}`}
        >
          ID: {objectId}
        </span>
      ) : null}
    </div>
  );
}

function ExclusiveBadge() {
  return (
    <span
      data-exclusive-badge
      data-exclusive-placement="price"
      className="inline-flex min-h-6 shrink-0 items-center rounded-md bg-[var(--accent)] px-2 text-[9px] font-bold leading-none text-white shadow-[0_5px_14px_rgba(138,21,21,0.20)] sm:text-[10px]"
    >
      Эксклюзив
    </span>
  );
}

export function buildPropertyCardTitle(listing: PropertyCardDto, cardKind: NonNullable<PropertyCardViewProps["cardKind"]>) {
  if (cardKind === "new-building") {
    return listing.title;
  }

  if (listing.categoryKey === "construction") {
    const area = listing.area ? `${formatNumber(listing.area)} м²` : null;
    return area && !listing.title.includes(area) ? `${listing.title}, ${area}` : listing.title;
  }

  const type = listing.categoryKey === "flat" || listing.categoryKey === "room"
    ? "квартира"
    : listing.categoryKey === "house"
      ? "дом"
      : listing.categoryKey === "land"
        ? "участок"
        : listing.categoryKey === "commercial"
          ? "коммерческий объект"
          : listing.category.toLowerCase();

  const parts = [
    type,
    listing.area ? `${listing.area} м²` : null,
    listing.floor ? `${listing.floor}/${listing.floorsTotal ?? "-"} эт.` : null,
  ].filter(Boolean) as string[];

  const roomPrefix = listing.rooms ? `${listing.rooms}-комн. ` : "";

  return parts.length ? `${roomPrefix}${parts.join(", ")}` : listing.title;
}

export function buildPropertyCardListTitle(listing: PropertyCardDto, cardKind: NonNullable<PropertyCardViewProps["cardKind"]>) {
  if (cardKind === "new-building") {
    return listing.title;
  }

  if (listing.categoryKey === "construction") {
    const facts = [
      listing.title,
      listing.area ? `${formatNumber(listing.area)} м²` : null,
      listing.rooms ? `${listing.rooms} комнаты` : null,
      listing.floorsTotal ? `${listing.floorsTotal} этаж` : null,
    ].filter(Boolean) as string[];

    return facts.join(" · ");
  }

  const type = listing.categoryKey === "flat" || listing.categoryKey === "room"
    ? "квартира"
    : listing.categoryKey === "house"
      ? "дом"
      : listing.categoryKey === "land"
        ? "участок"
        : listing.categoryKey === "commercial"
          ? "коммерческий объект"
          : listing.category.toLowerCase();

  const parts = [
    `${listing.rooms ? `${listing.rooms}-комн. ` : ""}${type}`,
    listing.area ? `${formatNumber(listing.area)} м²` : null,
    listing.floor ? `${listing.floor}/${listing.floorsTotal ?? "-"} эт.` : null,
  ].filter(Boolean) as string[];

  return parts.length ? parts.join(" · ") : listing.title;
}

function AddressLine({
  visiblePrefix,
  hiddenHousePart,
  compact = false,
}: {
  visiblePrefix: string | null;
  hiddenHousePart: string | null;
  compact?: boolean;
}) {
  if (!hiddenHousePart) {
    return <span className={compact ? "min-w-0 truncate" : "line-clamp-1"}>{visiblePrefix}</span>;
  }

  return (
    <span className={`min-w-0 ${compact ? "truncate" : "line-clamp-1"}`}>
      <span>{visiblePrefix}</span>
      <span
        aria-label="Номер дома скрыт"
        className="inline-flex align-baseline text-slate-400 select-none"
      >
        …
      </span>
    </span>
  );
}

export function cleanPropertyCardDisplayAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const withoutCountry = parts.filter((part, index) => {
    if (index > 1) return true;
    const normalized = part.toLowerCase().replace(/\./g, "");
    return normalized !== "россия" && normalized !== "рф" && normalized !== "российская федерация";
  });

  return withoutCountry.join(", ") || address;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCardPrice(listing: PropertyCardDto, cardKind: NonNullable<PropertyCardViewProps["cardKind"]>) {
  const price = formatPrice(listing.price);

  if ((cardKind === "construction" || cardKind === "new-building") && listing.price) {
    return `от ${price}`;
  }

  return price;
}

function formatPrice(price: number | null | undefined, fallback = "Цена по запросу") {
  if (price === null || price === undefined) return fallback;

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatListingDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function cleanListingDescription(value?: string | null, objectCode?: string) {
  if (!value) return null;

  const escapedCode = objectCode?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const codePattern = escapedCode
    ? new RegExp(`^\\s*Код\\s+объекта\\s*[:№#]?\\s*${escapedCode}\\.?\\s*`, "i")
    : /^\s*Код\s+объекта\s*[:№#]?\s*[\w.-]+\.?\s*/i;

  const normalized = value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(codePattern, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}
