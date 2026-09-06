/**
 * Catalog free-text search helpers.
 *
 * Address search must ignore commas/extra spaces and treat house numbers as
 * whole tokens ("Жукова 19" ≠ "Жукова 119" / description mentioning "19").
 */

const ADDRESS_STOPWORDS = new Set([
  "ул",
  "улица",
  "улицы",
  "пр",
  "просп",
  "проспект",
  "пер",
  "переулок",
  "б-р",
  "бульвар",
  "пл",
  "площадь",
  "наб",
  "набережная",
  "ш",
  "шоссе",
  "д",
  "дом",
  "г",
  "город",
  "пос",
  "поселок",
  "посёлок",
  "р-н",
  "район",
  "кв",
  "квартира",
  "квартал",
  "кв-л",
  "квл",
  "мкр",
  "мкрн",
  "микрорайон",
]);

export function normalizeCatalogAddressText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^0-9a-zа-я/-]+/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Feed object codes are long digit strings (e.g. 2287723).
 * They must not be treated as house numbers, or catalog `q` only searches address.
 */
export function isLikelyObjectCodeToken(token: string): boolean {
  return /^\d{5,}$/.test(token);
}

export function isHouseNumberToken(token: string): boolean {
  if (isLikelyObjectCodeToken(token)) {
    return false;
  }
  return /^\d+[a-zа-я]?$/i.test(token) || /^\d+\/\d+[a-zа-я]?$/i.test(token);
}

export function tokenizeCatalogSearchQuery(raw: string): string[] {
  const parts = normalizeCatalogAddressText(raw)
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return [];
  }

  const meaningful = parts.filter((part) => !ADDRESS_STOPWORDS.has(part));
  return meaningful.length > 0 ? meaningful : parts;
}

/** Address-scoped when the query includes a house number (short digits), so "19" cannot match description/119. */
export function shouldUseAddressScopedSearch(tokens: string[]): boolean {
  return tokens.some((token) => isHouseNumberToken(token));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole address-token match for house numbers (19, 19а; "37/1" is split into 37 + 1). */
export function addressHasHouseNumberToken(normalizedAddress: string, token: string): boolean {
  const house = token.toLowerCase().replace(/ё/g, "е");
  const pattern = new RegExp(`(?:^| )${escapeRegExp(house)}(?:[a-zа-я]?(?:$| )|/)`, "u");
  return pattern.test(normalizedAddress);
}

export function addressHasSearchToken(normalizedAddress: string, token: string): boolean {
  const normalizedToken = token.toLowerCase().replace(/ё/g, "е");
  if (isHouseNumberToken(normalizedToken)) {
    return addressHasHouseNumberToken(normalizedAddress, normalizedToken);
  }
  return normalizedAddress.includes(normalizedToken);
}

/**
 * Fallback / in-memory matcher.
 * Multi-token and house-number queries are address-scoped so a digit in the
 * description cannot satisfy the house number.
 */
export function matchesCatalogSearchHaystack(
  haystackParts: Array<string | null | undefined>,
  rawQuery: string,
  address?: string | null,
): boolean {
  const tokens = tokenizeCatalogSearchQuery(rawQuery);
  if (!tokens.length) {
    return true;
  }

  if (shouldUseAddressScopedSearch(tokens)) {
    const target = normalizeCatalogAddressText(address ?? "");
    if (!target) {
      return false;
    }
    return tokens.every((token) => addressHasSearchToken(target, token));
  }

  const haystack = normalizeCatalogAddressText(haystackParts.filter(Boolean).join(" "));
  return tokens.every((token) => haystack.includes(token.toLowerCase().replace(/ё/g, "е")));
}

/** PostgreSQL regex for a house-number token against a normalized address expression. */
export function houseNumberPostgresRegex(token: string): string {
  const house = token.toLowerCase().replace(/ё/g, "е");
  return `(^| )${escapeRegExp(house)}([a-zа-я]?($| )|/)`;
}
