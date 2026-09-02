export type DetailPageContent = {
  cityName: string
  labels: {
    apartments: string
    home: string
    newBuildings: string
    realty: string
  }
  routes: {
    allRealty: string
    apartments: string
    contacts: string
    mortgage: string
    newBuildings: string
  }
}

export function appendObjectQuery(href: string, title: string, request?: string) {
  const separator = href.includes('?') ? '&' : '?'
  const params = new URLSearchParams({ object: title })
  if (request) params.set('request', request)
  return `${href}${separator}${params.toString()}`
}
