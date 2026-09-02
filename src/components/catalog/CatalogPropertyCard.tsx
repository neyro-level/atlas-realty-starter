"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { formatPrice, type CatalogView, type ListingCard } from "@/lib/catalog";
import { shouldOptimizeCatalogImage } from "@/modules/media/image-optimization";
import { isNewBuildingListingId } from "@/modules/new-buildings";
import { SessionCollectionButton, toSessionListingItem } from "@/modules/session-collections";
import { useSiteShell } from "@/components/layout/SiteShellProvider";
import { useSiteContacts } from "@/components/layout/SiteContactsProvider";
import { splitBlurredAddress, shouldBlurPropertyAddress } from "@/shared/lib/property-address-blur";
import { buildTelHref } from "@/shared/lib/tel";

type Props = {
  listing: ListingCard;
  variant?: CatalogView;
  /** First visible cards: preload cover for faster paint. */
  priority?: boolean;
  /** Override card link (session collections may store non-property paths). */
  href?: string;
  /** Optional compact label over the cover image. */
  imageBadge?: string;
};

export function CatalogPropertyCard({ listing, variant = "grid", priority = false, href, imageBadge }: Props) {
  const shell = useSiteShell();
  const path = href ?? `${shell.routes.propertyBase}/${listing.slug}`;
  const images = useMemo(() => {
    const list = listing.images.length ? listing.images : listing.image ? [listing.image] : [];
    return [...new Set(list)].filter(Boolean);
  }, [listing.image, listing.images]);
  const [activeImage, setActiveImage] = useState(0);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentImage = images[activeImage];
  const contacts = useSiteContacts();
  const phone = contacts.phone;
  const phoneHref = contacts.phoneHref || buildTelHref(phone);
  /** Exclusive badge comes from XML overlay membership or a manual exclusive contract. */
  const showExclusiveBadge = Boolean(listing.isExclusive);
  const title = buildCardTitle(listing);
  const listTitle = buildListTitle(listing);
  const displayAddress = cleanDisplayAddress(listing.address);
  const shouldBlurAddress = shouldBlurPropertyAddress({
    enabled: Boolean(contacts.hidePropertyHouseNumbers),
    origin: listing.origin,
    categoryKey: listing.categoryKey,
  });
  const addressParts = shouldBlurAddress
    ? splitBlurredAddress(displayAddress)
    : { visiblePrefix: displayAddress, hiddenHousePart: null, applied: false };
  const priceLabel = formatCardPrice(listing);
  const isList = variant === "list";
  const listingDate = formatListingDate(listing.lastModified);
  const objectCode = listing.objectCode?.trim() || null;
  const isNewBuildingCard = isNewBuildingListingId(listing.id);
  const isXmlCatalogCard = !isNewBuildingCard && listing.categoryKey !== "construction";
  const showsPropertyIdentity = ["flat", "house", "land", "commercial"].includes(listing.categoryKey);
  const displayObjectId = showsPropertyIdentity ? objectCode ?? listing.id : null;
  const listDescription = cleanListingDescription(
    listing.description,
    objectCode ?? listing.id,
  );
  const sessionItem = useMemo(
    () => toSessionListingItem(listing, listTitle, path),
    [listing, listTitle, path],
  );
  const normalizedPropertyId = /^[a-z0-9]{8,64}$/i.test(listing.id) ? listing.id : undefined;
  const normalizedAgentId = listing.agentId && /^[a-z0-9]{8,64}$/i.test(listing.agentId) ? listing.agentId : undefined;
  function stop(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function openPropertyChat(event: MouseEvent<HTMLElement>) {
    stop(event);
    window.dispatchEvent(new CustomEvent("open-property-chat", {
      detail: {
        propertyId: normalizedPropertyId,
        agentId: normalizedAgentId,
        sourcePage: typeof window !== "undefined" ? window.location.pathname : "/nedvizhimost-rostov",
        propertyPath: path,
        title,
        address: displayAddress,
        objectCode,
      },
    }));
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
        className="group relative grid cursor-pointer gap-5 bg-transparent p-4 transition duration-300 hover:relative hover:z-10 hover:rounded-lg hover:bg-[#FAFAFA] hover:shadow-[0_4px_8px_rgba(0,0,0,0.02),0_22px_52px_rgba(0,0,0,0.10)] md:grid-cols-[300px_minmax(0,1fr)_230px] md:px-0 md:py-6"
      >
        <Link
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Открыть объект в новой вкладке: ${title}`}
          className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]"
        />

        <div
          className="relative z-20 h-[238px] touch-pan-y select-none overflow-hidden rounded-lg bg-[#EBEBE9] sm:h-[280px] md:h-[288px]"
          onTouchStart={onGalleryTouchStart}
          onTouchEnd={onGalleryTouchEnd}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={listing.title}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              quality={75}
              unoptimized={!shouldOptimizeCatalogImage(currentImage)}
              sizes="(max-width: 767px) calc(100vw - 32px), 300px"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[#827F81]">
              <Building2 className="size-8" aria-hidden />
            </span>
          )}

          <CatalogBadgeStack objectId={displayObjectId} imageBadge={imageBadge} className="left-3 top-3" />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[#18181A]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:left-3 lg:size-9 lg:bg-[#18181A]/62 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="size-5 lg:size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[#18181A]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:right-3 lg:size-9 lg:bg-[#18181A]/62 lg:opacity-0 lg:group-hover:opacity-100"
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
              <span className="absolute bottom-3 right-3 z-20 inline-flex min-h-7 items-center gap-1 rounded-full bg-[#18181A]/72 px-2.5 text-[10px] font-bold tabular-nums text-white shadow-[0_5px_14px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                <ImageIcon className="size-3.5" aria-hidden />
                {activeImage + 1}/{images.length}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex min-h-[238px] flex-col md:min-h-[288px]">
          <div className="min-w-0">
            <h3 className="text-[1.15rem] font-extrabold leading-6 tracking-[-0.01em] text-[#17161A]">
              {listTitle}
            </h3>
            <div className="mt-2 space-y-1.5 text-sm leading-5 tracking-[0.01em] text-[#827F81]">
              {listing.district && listing.district !== shell.citySwitcher.cities.find((city) => city.current)?.label ? (
                <p className="font-semibold text-[#8A1515]">{listing.district}</p>
              ) : null}
              <p className="flex min-w-0 items-center gap-1.5 text-[15.4px] leading-[22px] text-[#413F41] lg:text-sm lg:leading-5">
                <MapPin className="size-3.5 shrink-0 text-[#8A1515]" aria-hidden />
                <AddressLine visiblePrefix={addressParts.visiblePrefix} hiddenHousePart={addressParts.hiddenHousePart} />
              </p>
            </div>
          </div>

          {listDescription ? (
            <p className="mt-8 line-clamp-3 text-sm leading-6 tracking-[0.01em] text-[#17161A] md:mt-9">
              {listDescription}
            </p>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
            {phoneVisible ? (
              <a
                href={buildTelHref(phone)}
                onClick={stop}
                data-analytics-context="catalog_property_card"
                data-analytics-item={listing.slug}
                className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#18181A] px-5 text-center text-[15.4px] font-semibold tabular-nums text-white transition hover:bg-[#2A292C] lg:text-sm sm:min-w-[190px]"
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
                className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#18181A] px-5 text-center text-[15.4px] font-semibold text-white transition hover:bg-[#2A292C] lg:text-sm sm:min-w-[190px]"
              >
                <Phone className="size-[17.6px] lg:size-4" aria-hidden />
                Показать телефон
              </button>
            )}
            <button
              type="button"
              onClick={openPropertyChat}
              className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E3E3E1] bg-[#FAFAFA] px-5 text-center text-[15.4px] font-semibold text-[#17161A] transition hover:border-[#8A1515] hover:text-[#8A1515] lg:text-sm sm:min-w-[130px]"
            >
              <MessageCircle className="size-[17.6px] lg:size-4" aria-hidden />
              Написать
            </button>
          </div>
        </div>

        <div className={`flex min-h-[238px] flex-col justify-between gap-4 md:min-h-[288px] ${isNewBuildingCard || isXmlCatalogCard ? "md:pr-6" : ""}`}>
          <div className={isNewBuildingCard ? "flex flex-col items-end gap-4 pt-1" : "flex items-start justify-between gap-4 md:justify-end"}>
            <div data-catalog-price-row className="flex min-w-0 items-center gap-2 md:justify-end">
              <p className="text-[1.2rem] font-extrabold leading-none tabular-nums tracking-[-0.01em] text-[#17161A]">
                {priceLabel}
              </p>
              {showExclusiveBadge ? <ExclusiveBadge /> : null}
            </div>

            <div className={`relative z-20 flex shrink-0 flex-row gap-2 ${isNewBuildingCard ? "" : "md:flex-col"}`}>
              <SessionCollectionButton
                kind="compare"
                item={sessionItem}
                className="flex size-10 items-center justify-center rounded-lg border border-[#E3E3E1] bg-[#FAFAFA] text-[#17161A] transition hover:border-[#8A1515] hover:text-[#8A1515]"
              />
              <SessionCollectionButton
                kind="favorites"
                item={sessionItem}
                className="flex size-10 items-center justify-center rounded-lg border border-[#E3E3E1] bg-[#FAFAFA] text-[#17161A] transition hover:border-[#8A1515] hover:text-[#8A1515]"
              />
            </div>
          </div>

          {listingDate ? (
            <p className="hidden text-right text-xs font-medium leading-5 text-[#827F81] md:block">{listingDate}</p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative cursor-pointer rounded-lg bg-white/0 transition duration-300 ${
        isList
          ? "grid overflow-hidden border border-[#E3E3E1] bg-white shadow-none hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.02),0_20px_48px_rgba(0,0,0,0.08)] md:grid-cols-[320px_minmax(0,1fr)_210px]"
          : "-m-2 overflow-visible border border-transparent p-2 shadow-[0_1px_2px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.035)] transition-shadow lg:shadow-none hover:-translate-y-0.5 hover:border-[#E3E3E1] hover:bg-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_42px_rgba(0,0,0,0.08)]"
      }`}
    >
      <Link
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Открыть объект в новой вкладке: ${title}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]"
      />

      <div className={isList ? "p-3 md:pr-0" : ""}>
        <div
          className={`relative z-20 touch-pan-y select-none overflow-hidden rounded-lg bg-[#EBEBE9] ${isList ? "aspect-[16/10] md:h-full md:min-h-[214px]" : "aspect-[3/2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition duration-300 group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.09)]"}`}
          onTouchStart={onGalleryTouchStart}
          onTouchEnd={onGalleryTouchEnd}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={listing.title}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              quality={75}
              unoptimized={!shouldOptimizeCatalogImage(currentImage)}
              sizes={isList
                ? "(max-width: 767px) calc(100vw - 32px), 280px"
                : "(max-width: 639px) calc(100vw - 40px), (max-width: 1279px) 50vw, 25vw"}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[#827F81]">
              <Building2 className="size-8" aria-hidden />
            </span>
          )}

          <CatalogBadgeStack objectId={displayObjectId} imageBadge={imageBadge} className="left-2.5 top-2.5" />
          <div
            className={`absolute right-2.5 top-2.5 z-20 ${isNewBuildingCard || isXmlCatalogCard ? "" : "lg:hidden"}`}
            onClick={stop}
          >
            <SessionCollectionButton
              kind="favorites"
              item={sessionItem}
              className="flex size-9 items-center justify-center rounded-lg transition [&_svg]:!size-4"
              inactiveClassName="bg-[#FAFAFA] text-[#413F41] hover:bg-[#F7F2F2] hover:text-[#8A1515]"
              activeClassName="bg-[#F7F2F2] text-[#8A1515]"
            />
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[#18181A]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:left-3 lg:size-9 lg:bg-[#18181A]/62 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2.5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[#18181A]/28 text-white opacity-60 backdrop-blur-sm transition active:opacity-90 lg:right-3 lg:size-9 lg:bg-[#18181A]/62 lg:opacity-0 lg:group-hover:opacity-100"
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

              <span className="absolute bottom-2.5 right-2.5 z-20 inline-flex min-h-6 items-center gap-1 rounded-md bg-[#18181A]/66 px-2 text-[10px] font-bold tabular-nums text-white shadow-[0_5px_14px_rgba(0,0,0,0.10)] backdrop-blur-sm">
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
            <p className="min-w-0 text-[1.19rem] font-extrabold leading-none tabular-nums tracking-[-0.01em] text-[#17161A] md:text-[1.32rem] lg:text-[1.28rem]">{priceLabel}</p>
            {showExclusiveBadge ? <ExclusiveBadge /> : null}
          </div>
          <div className="relative z-20 row-span-3 flex w-10 shrink-0 flex-col items-center gap-[7px] self-start justify-start lg:hidden" onClick={stop}>
            <div className="flex w-10 flex-col items-center gap-[7px]">
              <a
                href={phoneHref}
                aria-label={`Позвонить: ${phone}`}
                data-analytics-context="catalog_property_card_call"
                data-analytics-item={listing.slug}
                className="inline-flex size-10 items-center justify-center rounded-lg bg-[#FAFAFA] text-[#413F41] transition hover:bg-[#F7F2F2] hover:text-[#8A1515]"
              >
                <Phone className="size-[18.7px]" strokeWidth={1.85} aria-hidden />
              </a>
              <button
                type="button"
                onClick={openPropertyChat}
                aria-label="Открыть чат"
                className="inline-flex size-10 items-center justify-center rounded-lg bg-[#FAFAFA] text-[#413F41] transition hover:bg-[#F7F2F2] hover:text-[#8A1515]"
              >
                <MessageCircle className="size-[18.7px]" strokeWidth={1.85} aria-hidden />
              </button>
            </div>
          </div>
          {!isNewBuildingCard && !isXmlCatalogCard ? (
            <div className="relative z-20 hidden items-center justify-end gap-1.5 lg:flex" onClick={stop}>
              <SessionCollectionButton
                kind="compare"
                item={sessionItem}
                className="flex size-10 items-center justify-center rounded-lg transition"
                inactiveClassName="bg-[#FAFAFA] text-[#413F41] hover:bg-[#F7F2F2] hover:text-[#8A1515]"
                activeClassName="bg-[#F7F2F2] text-[#8A1515]"
              />
              <SessionCollectionButton
                kind="favorites"
                item={sessionItem}
                className="flex size-10 items-center justify-center rounded-lg transition"
                inactiveClassName="bg-[#FAFAFA] text-[#413F41] hover:bg-[#F7F2F2] hover:text-[#8A1515]"
                activeClassName="bg-[#F7F2F2] text-[#8A1515]"
              />
            </div>
          ) : null}
          <h3 className="line-clamp-2 rounded-md text-[0.9rem] font-extrabold leading-[1.2] tracking-[-0.01em] text-[#17161A] transition-colors group-active:text-[#8A1515] md:text-[0.99rem] md:leading-[1.32rem] lg:mt-2 lg:text-[0.98rem] lg:leading-5 lg:group-hover:text-[#8A1515]">
          {title}
          </h3>
          <div className="text-[10.45px] leading-[1.16rem] tracking-[0.01em] text-[#827F81] md:text-[11px] md:leading-[1.19rem] lg:mt-2 lg:text-xs lg:leading-5">
          <p className="flex min-w-0 items-center gap-1 font-semibold text-[#413F41] md:gap-1.5">
            <MapPin className="size-3 shrink-0 text-[#8A1515] md:size-3.5" aria-hidden />
            <AddressLine visiblePrefix={addressParts.visiblePrefix} hiddenHousePart={addressParts.hiddenHousePart} compact />
          </p>
          </div>
        </div>
        {isList && listing.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 tracking-[0.01em] text-[#413F41]">{listing.description}</p>
        ) : null}
        {isList ? <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#827F81]">{listing.category} · база {shell.brand.name}</p> : null}
      </div>

      {isList ? (
        <div className="grid content-end gap-2 p-4 md:border-l md:border-[#E3E3E1] md:p-5">
          {phoneVisible ? (
            <a
                href={buildTelHref(phone)}
                onClick={stop}
                data-analytics-context="catalog_property_card"
                data-analytics-item={listing.slug}
                className="relative z-20 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#8A1515] px-3 text-center text-sm font-bold tabular-nums text-white transition hover:bg-[#630E0E]"
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
                className="relative z-20 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#8A1515] px-3 text-center text-sm font-bold text-white transition hover:bg-[#630E0E]"
              >
              <Phone className="size-4" aria-hidden />
              Показать телефон
            </button>
          )}
          <button
            type="button"
            onClick={openPropertyChat}
            className="relative z-20 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#E3E3E1] bg-white px-3 text-center text-sm font-bold text-[#17161A] transition hover:border-[#8A1515] hover:text-[#8A1515]"
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
        <span data-sales-leader-badge className="inline-flex min-h-6 items-center rounded-md bg-[#8A1515] px-2.5 text-[10px] font-bold leading-none text-white shadow-[0_5px_14px_rgba(138,21,21,0.20)]">
          {imageBadge}
        </span>
      ) : null}
      {objectId ? (
        <span
          data-catalog-object-code={objectId}
          className="inline-flex min-h-6 max-w-[168px] items-center truncate rounded-md bg-white/94 px-2 text-[10px] font-medium leading-none tabular-nums text-[#17161A] shadow-[0_5px_14px_rgba(0,0,0,0.07)] backdrop-blur-sm"
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
      className="inline-flex min-h-6 shrink-0 items-center rounded-md bg-[#8A1515] px-2 text-[9px] font-bold leading-none text-white shadow-[0_5px_14px_rgba(138,21,21,0.20)] sm:text-[10px]"
    >
      Эксклюзив
    </span>
  );
}

function buildCardTitle(listing: ListingCard) {
  if (isNewBuildingListingId(listing.id)) {
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

function buildListTitle(listing: ListingCard) {
  if (isNewBuildingListingId(listing.id)) {
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

function cleanDisplayAddress(address: string) {
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

function formatCardPrice(listing: ListingCard) {
  const price = formatPrice(listing.price);

  if ((listing.categoryKey === "construction" || isNewBuildingListingId(listing.id)) && listing.price) {
    return `от ${price}`;
  }

  return price;
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
