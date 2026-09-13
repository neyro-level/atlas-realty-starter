import { afterEach, describe, expect, it, vi } from 'vitest'

import { canInitializeCatalogMap } from '@/components/catalog/new-building-catalog-map-model'
import { pointsWithinBounds, withMapSdkTimeout } from '@/core/integrations/maps/yandex-maps'

afterEach(() => {
  vi.useRealTimers()
})

describe('catalog map adapter', () => {
  it('does not initialize without an API key or visible points', () => {
    expect(canInitializeCatalogMap(null, 1)).toBe(false)
    expect(canInitializeCatalogMap(undefined, 1)).toBe(false)
    expect(canInitializeCatalogMap('key', 0)).toBe(false)
    expect(canInitializeCatalogMap('key', 1)).toBe(true)
  })

  it('rejects after the 12 second SDK timeout', async () => {
    vi.useFakeTimers()
    const rejection = expect(withMapSdkTimeout(new Promise<never>(() => undefined))).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(12_001)
    await rejection
  })

  it('selects only points inside the current bbox', () => {
    const points = [
      { body: '', coordinates: [45, 39] as const, id: 'inside', title: '' },
      { body: '', coordinates: [46, 40] as const, id: 'outside', title: '' },
    ]
    expect(pointsWithinBounds(points, [[44.9, 38.9], [45.1, 39.1]]).map((point) => point.id)).toEqual(['inside'])
  })
})
