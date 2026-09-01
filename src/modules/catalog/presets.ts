export type CatalogMode = 'all' | 'commercial' | 'country' | 'flat' | 'new_building'

export type CatalogPreset = {
  path: string
  title: string
  description: string
  mode: CatalogMode
  fixed: {
    category?: 'commercial' | 'flat' | 'house' | 'land' | 'room'
    commercialType?: string
    rooms?: number
    studio?: boolean
  }
}

export const catalogPresets: CatalogPreset[] = [
  { path: '/nedvizhimost-rostov', title: 'Недвижимость в Ростове-на-Дону', description: 'Квартиры, дома, участки, новостройки и коммерческая недвижимость.', mode: 'all', fixed: {} },
  { path: '/novostroyki-rostova', title: 'Новостройки Ростова-на-Дону', description: 'Жилые комплексы Ростова по районам, срокам и условиям покупки.', mode: 'new_building', fixed: {} },
  { path: '/kvartiry-rostova', title: 'Квартиры в Ростове-на-Дону', description: 'Опубликованные квартиры и комнаты из актуального каталога.', mode: 'flat', fixed: { category: 'flat' } },
  { path: '/odnokomnatnye-kvartiry-rostov', title: 'Однокомнатные квартиры в Ростове', description: 'Опубликованные однокомнатные квартиры.', mode: 'flat', fixed: { category: 'flat', rooms: 1 } },
  { path: '/dvuhkomnatnye-kvartiry-rostov', title: 'Двухкомнатные квартиры в Ростове', description: 'Опубликованные двухкомнатные квартиры.', mode: 'flat', fixed: { category: 'flat', rooms: 2 } },
  { path: '/trehkomnatnye-kvartiry-rostov', title: 'Трёхкомнатные квартиры в Ростове', description: 'Опубликованные трёхкомнатные квартиры.', mode: 'flat', fixed: { category: 'flat', rooms: 3 } },
  { path: '/kvartiry-studii-rostov', title: 'Квартиры-студии в Ростове', description: 'Опубликованные студии в Ростове-на-Дону.', mode: 'flat', fixed: { category: 'flat', studio: true } },
  { path: '/zagorodnaya-nedvizhimost', title: 'Загородная недвижимость в Ростове', description: 'Дома и земельные участки.', mode: 'country', fixed: {} },
  { path: '/doma-rostov', title: 'Дома в Ростове-на-Дону', description: 'Опубликованные дома.', mode: 'country', fixed: { category: 'house' } },
  { path: '/zemelnye-uchastki-rostov', title: 'Земельные участки в Ростове', description: 'Опубликованные земельные участки.', mode: 'country', fixed: { category: 'land' } },
  { path: '/kommercheskaya-nedvizhimost', title: 'Коммерческая недвижимость в Ростове', description: 'Офисы, торговые площади, склады и помещения.', mode: 'commercial', fixed: { category: 'commercial' } },
  { path: '/ofisy-rostov', title: 'Офисы в Ростове-на-Дону', description: 'Опубликованные офисные помещения.', mode: 'commercial', fixed: { category: 'commercial', commercialType: 'office' } },
  { path: '/torgovye-pomeshcheniya-rostov', title: 'Торговые помещения в Ростове', description: 'Опубликованные торговые помещения.', mode: 'commercial', fixed: { category: 'commercial', commercialType: 'retail' } },
  { path: '/sklady-rostov', title: 'Склады в Ростове-на-Дону', description: 'Опубликованные складские помещения.', mode: 'commercial', fixed: { category: 'commercial', commercialType: 'warehouse' } },
]

export const catalogPresetPaths = catalogPresets.map((preset) => preset.path)
const presetMap = new Map(catalogPresets.map((preset) => [preset.path, preset]))

export function getCatalogPreset(path: string) {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  return presetMap.get(normalized) ?? null
}
