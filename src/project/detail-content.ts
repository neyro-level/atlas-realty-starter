import type { DetailPageContent } from '@/shared/types/detail-pages'

export const detailPageContent: DetailPageContent = {
  cityName: 'Ростов-на-Дону',
  labels: {
    apartments: 'Квартиры',
    home: 'Главная',
    newBuildings: 'Новостройки',
    realty: 'Недвижимость',
  },
  routes: {
    allRealty: '/nedvizhimost-rostov',
    apartments: '/kvartiry-rostova',
    contacts: '/contacts',
    mortgage: '/ipoteka',
    newBuildings: '/novostroyki-rostova',
  },
}
