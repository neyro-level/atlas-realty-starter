/**
 * Mobile route links for Yandex Navigator / Maps.
 *
 * Official Navigator deep link (`yandexnavi://build_route_on_map`) needs lat/lon
 * and for commercial sites may also need a partner signature (Navigator ≥2.40).
 * Without coordinates we open address search in Navigator, with HTTPS Maps
 * `rtext=~address&rtt=auto` as the reliable route fallback (from current location).
 */

export function buildYandexNavigatorSearchUrl(address: string): string {
  const text = address.trim();
  if (!text) {
    throw new Error("Yandex Navigator search requires a non-empty address");
  }
  return `yandexnavi://map_search?text=${encodeURIComponent(text)}`;
}

/** Route from the user's current location to the office address (Maps / app handoff). */
export function buildYandexMapsRouteUrl(address: string): string {
  const text = address.trim();
  if (!text) {
    throw new Error("Yandex Maps route requires a non-empty address");
  }
  return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(text)}&rtt=auto`;
}

export function buildYandexNavigatorRouteUrl(address: string, coords?: { lat: number; lon: number }): string {
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lon)) {
    return `yandexnavi://build_route_on_map?lat_to=${coords.lat}&lon_to=${coords.lon}`;
  }
  return buildYandexNavigatorSearchUrl(address);
}
