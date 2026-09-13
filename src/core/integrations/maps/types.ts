export type MapCoordinates = readonly [latitude: number, longitude: number]

export type MapPoint = {
  body: string
  coordinates: MapCoordinates
  id: string
  title: string
}

export interface MapAdapter {
  init(element: HTMLElement, center: MapCoordinates, zoom: number): Promise<void>
  addPoints(points: MapPoint[]): void
  setCenter(coordinates: MapCoordinates, zoom?: number): void
  destroy(): void
}
