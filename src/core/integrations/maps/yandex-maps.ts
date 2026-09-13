import type { MapAdapter, MapCoordinates, MapPoint } from './types'
import { YANDEX_MAPS_API_ORIGIN, YANDEX_MAPS_SCRIPT_ID, YANDEX_MAPS_TIMEOUT_MS } from './provider-config'

export { YANDEX_MAPS_SCRIPT_ID, YANDEX_MAPS_TIMEOUT_MS } from './provider-config'

type YandexEvent = { get: (name: string) => unknown }
type YandexEvents = {
  add: (event: string, callback: (event: YandexEvent) => void) => void
  remove: (event: string, callback: (event: YandexEvent) => void) => void
}
type YandexMap = {
  destroy: () => void
  events: YandexEvents
  geoObjects: { add: (object: YandexObjectManager) => void }
  getBounds: () => [[number, number], [number, number]] | null
  setCenter: (coordinates: MapCoordinates, zoom?: number) => void
}
type YandexObjectManager = {
  add: (objects: YandexFeatureCollection) => void
  removeAll: () => void
  objects: { events: YandexEvents }
}
type YandexFeature = {
  geometry: { coordinates: MapCoordinates; type: 'Point' }
  id: string
  properties: { balloonContentBody: string; balloonContentHeader: string }
  type: 'Feature'
}
type YandexFeatureCollection = { features: YandexFeature[]; type: 'FeatureCollection' }
type YandexMapsApi = {
  Map: new (element: HTMLElement, state: { center: MapCoordinates; zoom: number }, options?: Record<string, unknown>) => YandexMap
  ObjectManager: new (options: Record<string, unknown>) => YandexObjectManager
  ready: (callback: () => void) => void
}

declare global {
  interface Window { ymaps?: YandexMapsApi }
}

export function pointsWithinBounds(points: MapPoint[], bounds: [[number, number], [number, number]] | null): MapPoint[] {
  if (!bounds) return []
  const minLatitude = Math.min(bounds[0][0], bounds[1][0])
  const maxLatitude = Math.max(bounds[0][0], bounds[1][0])
  const minLongitude = Math.min(bounds[0][1], bounds[1][1])
  const maxLongitude = Math.max(bounds[0][1], bounds[1][1])
  return points.filter(({ coordinates: [latitude, longitude] }) => (
    latitude >= minLatitude && latitude <= maxLatitude && longitude >= minLongitude && longitude <= maxLongitude
  ))
}

export function createYandexMapAdapter(options: {
  apiKey: string
  onPointClick: (id: string) => void
  timeoutMs?: number
}): MapAdapter {
  let map: YandexMap | null = null
  let objectManager: YandexObjectManager | null = null
  let points: MapPoint[] = []

  const renderVisiblePoints = () => {
    if (!map || !objectManager) return
    objectManager.removeAll()
    objectManager.add(toFeatureCollection(pointsWithinBounds(points, map.getBounds())))
  }
  const handleBoundsChange = () => renderVisiblePoints()
  const handleObjectClick = (event: YandexEvent) => {
    const id = event.get('objectId')
    if (typeof id === 'string') options.onPointClick(id)
  }

  return {
    async init(element, center, zoom) {
      const ymaps = await loadYandexMaps(options.apiKey, options.timeoutMs)
      map = new ymaps.Map(element, { center, zoom }, { suppressMapOpenBlock: true })
      objectManager = new ymaps.ObjectManager({ clusterize: true, gridSize: 64 })
      objectManager.objects.events.add('click', handleObjectClick)
      map.events.add('boundschange', handleBoundsChange)
      map.geoObjects.add(objectManager)
      renderVisiblePoints()
    },
    addPoints(nextPoints) {
      points = nextPoints
      renderVisiblePoints()
    },
    setCenter(coordinates, zoom) { map?.setCenter(coordinates, zoom) },
    destroy() {
      map?.events.remove('boundschange', handleBoundsChange)
      objectManager?.objects.events.remove('click', handleObjectClick)
      map?.destroy()
      map = null
      objectManager = null
      points = []
    },
  }
}

export function loadYandexMaps(apiKey: string, timeoutMs = YANDEX_MAPS_TIMEOUT_MS): Promise<YandexMapsApi> {
  if (window.ymaps) return Promise.resolve(window.ymaps)

  const existing = document.getElementById(YANDEX_MAPS_SCRIPT_ID) as HTMLScriptElement | null
  const script = existing ?? document.createElement('script')
  let removeListeners = () => undefined
  const loading = new Promise<YandexMapsApi>((resolve, reject) => {
    const onLoad = () => {
      if (!window.ymaps) return reject(new Error('Yandex Maps SDK loaded without an API.'))
      window.ymaps.ready(() => resolve(window.ymaps as YandexMapsApi))
    }
    const onError = () => reject(new Error('Yandex Maps SDK failed to load.'))
    removeListeners = () => {
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
    }

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    if (!existing) {
      script.id = YANDEX_MAPS_SCRIPT_ID
      script.async = true
      script.src = `${YANDEX_MAPS_API_ORIGIN}/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`
      document.head.appendChild(script)
    }
  })
  return withMapSdkTimeout(loading, timeoutMs).finally(removeListeners)
}

export function withMapSdkTimeout<T>(loading: Promise<T>, timeoutMs = YANDEX_MAPS_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => reject(new Error('Yandex Maps SDK timed out.')), timeoutMs)
    void loading.then(
      (value) => { globalThis.clearTimeout(timeout); resolve(value) },
      (error: unknown) => { globalThis.clearTimeout(timeout); reject(error) },
    )
  })
}

function toFeatureCollection(points: MapPoint[]): YandexFeatureCollection {
  return {
    features: points.map((point) => ({
      geometry: { coordinates: point.coordinates, type: 'Point' },
      id: point.id,
      properties: { balloonContentBody: point.body, balloonContentHeader: point.title },
      type: 'Feature',
    })),
    type: 'FeatureCollection',
  }
}
