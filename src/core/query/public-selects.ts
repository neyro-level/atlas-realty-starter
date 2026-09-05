export const publicPropertySelect = {
  addressPublic: true, agent: true, category: true, dealStatus: true, dealType: true, description: true, district: true,
  floor: true, floorsTotal: true, id: true, market: true, meta: true, photos: true, priceMinorUnits: true,
  pricePerMeterMinorUnits: true, rooms: true, slug: true, status: true, title: true, totalAreaCm2: true, updatedAt: true,
} as const

export const publicPropertyDetailSelect = { ...publicPropertySelect, building: true, complex: true, latitude: true, longitude: true, mortgageAvailable: true, videoUrl: true } as const
export const publicComplexSelect = { address: true, availablePropertyCount: true, description: true, developer: true, district: true, id: true, meta: true, name: true, photos: true, readiness: true, slug: true } as const
export const publicAgentSelect = { bio: true, email: true, id: true, meta: true, name: true, phone: true, photo: true, position: true, slug: true } as const
export const publicPageSelect = { content: true, id: true, meta: true, slug: true, title: true, updatedAt: true } as const
export const publicPostSelect = { content: true, excerpt: true, id: true, meta: true, publishedAt: true, slug: true, title: true, updatedAt: true } as const
export const publicRedirectSelect = { from: true, to: true, type: true } as const
