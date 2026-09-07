import type { PropertyCardDto } from "@starter/site-contracts";
import type { PropertyCardViewProps } from "./PropertyCardView";

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

export function AddressLine({
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

export function formatCardPrice(listing: PropertyCardDto, cardKind: NonNullable<PropertyCardViewProps["cardKind"]>) {
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

export function formatListingDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function cleanListingDescription(value?: string | null, objectCode?: string) {
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
