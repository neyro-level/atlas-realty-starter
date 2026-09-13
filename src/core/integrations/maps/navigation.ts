import { YANDEX_MAPS_PUBLIC_ORIGIN } from './provider-config'

export function buildYandexNavigatorSearchURL(address: string): string {
  const text = requiredAddress(address)
  return `yandexnavi://map_search?text=${encodeURIComponent(text)}`
}

export function buildYandexMapsRouteURL(address: string): string {
  const text = requiredAddress(address)
  return `${YANDEX_MAPS_PUBLIC_ORIGIN}/maps/?rtext=~${encodeURIComponent(text)}&rtt=auto`
}

export function buildYandexNavigatorRouteURL(address: string, coordinates?: { lat: number; lon: number }): string {
  if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon)) {
    return `yandexnavi://build_route_on_map?lat_to=${coordinates.lat}&lon_to=${coordinates.lon}`
  }
  return buildYandexNavigatorSearchURL(address)
}

export function buildYandexMapSearchURL(address: string, city?: string): string {
  return `${YANDEX_MAPS_PUBLIC_ORIGIN}/maps/?text=${encodeURIComponent([city, requiredAddress(address)].filter(Boolean).join(', '))}`
}

export function buildYandexMapWidgetURL(address: string): string {
  return `${YANDEX_MAPS_PUBLIC_ORIGIN}/map-widget/v1/?text=${encodeURIComponent(requiredAddress(address))}`
}

export function buildYandexCoordinateWidgetURL(latitude: number, longitude: number): string {
  const url = new URL(`${YANDEX_MAPS_PUBLIC_ORIGIN}/map-widget/v1/`)
  setCoordinates(url, latitude, longitude)
  return url.toString()
}

export function buildYandexSearchWidgetURL(address: string, name: string): string {
  const url = new URL(`${YANDEX_MAPS_PUBLIC_ORIGIN}/map-widget/v1/`)
  url.searchParams.set('text', `${name}, ${requiredAddress(address)}`)
  url.searchParams.set('z', '16')
  return url.toString()
}

export function buildYandexLocationURL(input: { address: string; latitude: number | null; longitude: number | null; name: string }): string {
  const url = new URL(`${YANDEX_MAPS_PUBLIC_ORIGIN}/maps/`)
  if (input.latitude !== null && input.longitude !== null) setCoordinates(url, input.latitude, input.longitude)
  else url.searchParams.set('text', `${input.name}, ${requiredAddress(input.address)}`)
  return url.toString()
}

function setCoordinates(url: URL, latitude: number, longitude: number) {
  url.searchParams.set('ll', `${longitude},${latitude}`)
  url.searchParams.set('pt', `${longitude},${latitude},pm2rdm`)
  url.searchParams.set('z', '16')
}

function requiredAddress(address: string) {
  const normalized = address.trim()
  if (!normalized) throw new Error('Yandex Maps requires a non-empty address')
  return normalized
}
