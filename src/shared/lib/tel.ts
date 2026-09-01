export function buildTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
