import { toTranslitSlug } from "@/shared/lib/slugify";
import { tenant } from "@/project/tenant";

export const PUBLIC_PROPERTY_CITY_SLUG = tenant.cityEn;
export const PUBLIC_PROPERTY_CITY_SCOPE = tenant.cityScope;

// Compatibility scope for the unchanged Prisma ingest adapter. Public fixture UI uses siteIdentity.
const PRISMA_ENGINE_CITY_RU = "Луганск";
const PRISMA_ENGINE_CITY_LOCALITIES = [
  "Роскошное", "Валуйское", "Макарово", "Ольховое", "Николаевка", "Пионерское",
  "Фабричное", "Георгиевка", "Александровск", "Тепличное", "Станица Луганская",
  "Юбилейное", "Станично-Луганский", "Лутугинский",
] as const;

const UNSUPPORTED_PUBLIC_CITY_SLUG = "__unsupported_public_city__";

export type PropertyScopeStatusValue = "IN_SCOPE" | "OUT_OF_SCOPE" | "UNKNOWN";

export type PropertyScopeClassification = {
  status: PropertyScopeStatusValue;
  reason: string;
  evaluatedAt: Date;
};

const REGION_OR_COUNTRY_MARKERS = [
  "луганская область",
  "луганский регион",
  "лнр",
  "россия",
  "рф",
  "российская федерация",
] as const;

/**
 * Street and address-unit markers.
 * Long markers: prefix / suffix / mid-token (whitespace-separated).
 * Short abbreviations: prefix / suffix only (avoid false mid-token hits).
 */
const STREET_TYPE_MARKERS_LONG = [
  "улица",
  "проспект",
  "переулок",
  "бульвар",
  "шоссе",
  "квартал",
  "микрорайон",
  "дом",
  "площадь",
  "проезд",
  "тупик",
  "набережная",
  "квартира",
  "корпус",
  "строение",
  "литера",
  "офис",
  "помещение",
] as const;

const STREET_TYPE_MARKERS_SHORT = [
  "ул",
  "пр",
  "пер",
  "б-р",
  "ш",
  "мкр",
  "д",
  "пл",
  "кв",
  "корп",
  "стр",
  "лит",
  "оф",
  "пом",
] as const;

/**
 * Intra-city / local place markers (not foreign settlements).
 * Long: prefix / suffix / mid-token. Short: prefix / suffix only.
 */
const LOCAL_PLACE_MARKERS_LONG = [
  "городок",
  "район",
  "поселок",
  "разъезд",
  "территория",
  "садовое товарищество",
  "садовый массив",
] as const;

const LOCAL_PLACE_MARKERS_SHORT = [
  "р-н",
  "пос",
  "гск",
  "снт",
  "ст",
  "днп",
  "тсн",
  "гаражно",
] as const;

const APPROVED_LUGANSK_LOCALITIES = new Set(
  PRISMA_ENGINE_CITY_LOCALITIES.map((locality) => normalizeScopeLocalityName(locality)),
);

/**
 * tenant-specific: classify feed geography for this fork's city scope.
 * Region labels are not cities. Conflicts and empty values stay UNKNOWN.
 */
export function classifyPropertyScope(
  city: string | null | undefined,
  address?: string | null,
): PropertyScopeClassification {
  const evaluatedAt = new Date();
  const signals = collectScopeSignals(city, address);

  if (signals.inScope && signals.outOfScope) {
    return {
      status: "UNKNOWN",
      reason: "conflicting_city_signals",
      evaluatedAt,
    };
  }

  if (signals.inScope) {
    return {
      status: "IN_SCOPE",
      reason: signals.inReason ?? "matched_city_scope",
      evaluatedAt,
    };
  }

  if (signals.outOfScope) {
    return {
      status: "OUT_OF_SCOPE",
      reason: signals.outReason ?? "other_settlement",
      evaluatedAt,
    };
  }

  if (signals.sawRegionOnly) {
    return {
      status: "UNKNOWN",
      reason: "region_without_city",
      evaluatedAt,
    };
  }

  return {
    status: "UNKNOWN",
    reason: "missing_or_unresolved_city",
    evaluatedAt,
  };
}

export function isAllowedFeedCity(city: string | null | undefined, address?: string | null) {
  return classifyPropertyScope(city, address).status === "IN_SCOPE";
}

export function resolveCanonicalImportCity(
  city: string | null | undefined,
  address?: string | null,
  status: PropertyScopeStatusValue = classifyPropertyScope(city, address).status,
) {
  return status === "IN_SCOPE" ? PRISMA_ENGINE_CITY_RU : city?.trim() || null;
}

export function resolvePublicCitySlug(slug: string | null | undefined) {
  return slug && PUBLIC_PROPERTY_CITY_SCOPE.includes(slug)
    ? slug
    : UNSUPPORTED_PUBLIC_CITY_SLUG;
}

function collectScopeSignals(city: string | null | undefined, address?: string | null) {
  let inScope = false;
  let outOfScope = false;
  let sawRegionOnly = false;
  let inReason: string | undefined;
  let outReason: string | undefined;

  const cityTrimmed = city?.trim() ?? "";
  if (cityTrimmed) {
    const kind = classifyPlaceToken(cityTrimmed);
    if (kind === "in_scope") {
      inScope = true;
      inReason = "city_field_in_scope";
    } else if (kind === "out_of_scope") {
      outOfScope = true;
      outReason = "city_field_out_of_scope";
    } else if (kind === "region") {
      sawRegionOnly = true;
    }
  }

  for (const segment of getAddressSegments(address)) {
    const kind = classifyPlaceToken(segment);
    if (kind === "in_scope") {
      inScope = true;
      inReason ??= "address_segment_in_scope";
    } else if (kind === "out_of_scope") {
      outOfScope = true;
      outReason ??= "address_segment_out_of_scope";
    } else if (kind === "region") {
      sawRegionOnly = true;
    }
  }

  return { inScope, outOfScope, sawRegionOnly, inReason, outReason };
}

function classifyPlaceToken(value: string): "in_scope" | "out_of_scope" | "region" | "ignore" {
  const normalized = normalizeCityName(value);
  if (!normalized) {
    return "ignore";
  }

  if (isRegionOrCountryMarker(normalized)) {
    return "region";
  }

  if (isStreetLike(normalized)) {
    return "ignore";
  }

  // House / building numbers after commas ("…, 15", "15а", "12/3") are not settlements.
  if (isHouseNumberLike(normalized)) {
    return "ignore";
  }

  if (isScopedCityName(value)) {
    return "in_scope";
  }

  // Local place markers (garage co-ops, garden partnerships) are not foreign cities.
  if (isLocalPlaceLike(normalized)) {
    return "ignore";
  }

  return "out_of_scope";
}

function isScopedCityName(value: string) {
  const normalized = normalizeCityName(value);
  const slug = toTranslitSlug(normalized, 120);

  if (PUBLIC_PROPERTY_CITY_SCOPE.includes(slug)) {
    return true;
  }

  const normalizedLocality = normalizeScopeLocalityName(value);
  if (
    normalized === normalizeCityName(PRISMA_ENGINE_CITY_RU) ||
    normalizedLocality === normalizeCityName(PRISMA_ENGINE_CITY_RU)
  ) {
    return true;
  }

  return APPROVED_LUGANSK_LOCALITIES.has(normalizedLocality);
}

function isRegionOrCountryMarker(normalized: string) {
  return REGION_OR_COUNTRY_MARKERS.some(
    (marker) => normalized === marker || normalized.startsWith(`${marker} `),
  );
}

function isStreetLike(normalized: string) {
  return (
    matchesTypeMarker(normalized, STREET_TYPE_MARKERS_LONG, true) ||
    matchesTypeMarker(normalized, STREET_TYPE_MARKERS_SHORT, false)
  );
}

/** Digits with optional letter / slash / hyphen — not a city signal. */
function isHouseNumberLike(normalized: string) {
  return /^\d+[а-яa-z]?(?:[\/\-]\d+[а-яa-z]?)?$/u.test(normalized);
}

/**
 * GSK / SNT / garden society / intra-city micro-places (городок, район, посёлок…)
 * — local address parts, not foreign settlements.
 */
function isLocalPlaceLike(normalized: string) {
  return (
    matchesTypeMarker(normalized, LOCAL_PLACE_MARKERS_LONG, true) ||
    matchesTypeMarker(normalized, LOCAL_PLACE_MARKERS_SHORT, false)
  );
}

/**
 * Marker match: always prefix («улица …») or suffix («… улица»).
 * Long markers also match as a mid whitespace-token («2-я улица Свердлова»).
 * Short markers never mid-token (avoids «ш» / «д» / «ул» false hits).
 */
function matchesTypeMarker(
  normalized: string,
  markers: readonly string[],
  allowMidToken: boolean,
) {
  return markers.some((marker) => {
    if (
      normalized === marker ||
      normalized.startsWith(`${marker} `) ||
      normalized.endsWith(` ${marker}`)
    ) {
      return true;
    }
    if (!allowMidToken) {
      return false;
    }
    // Multi-word markers (e.g. «садовое товарищество») as contiguous mid-token span.
    if (marker.includes(" ")) {
      return ` ${normalized} `.includes(` ${marker} `);
    }
    const tokens = normalized.split(" ");
    return tokens.includes(marker);
  });
}

function normalizeCityName(value: string) {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(г|город)\s+/u, "")
    .replace(/\s+(г|город)$/u, "")
    .trim();
}

function normalizeScopeLocalityName(value: string) {
  return normalizeCityName(value)
    .replace(/^(?:поселок городского типа|пгт)\s+/u, "")
    .replace(/^(?:муниципальный|городской)\s+округ\s+/u, "")
    .replace(/^(?:село|с|поселок|п|ст)\s+/u, "")
    .replace(/\s+(?:муниципальный|городской)\s+округ$/u, "")
    .trim();
}

function getAddressSegments(address: string | null | undefined) {
  return (address ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
