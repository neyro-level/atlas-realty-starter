import { YANDEX_MAPS_API_ORIGIN, YANDEX_MAPS_STATIC_ORIGIN, YANDEX_MAPS_TILE_ORIGIN } from '../integrations/maps/provider-config'

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  `connect-src 'self' ${YANDEX_MAPS_API_ORIGIN} ${YANDEX_MAPS_TILE_ORIGIN}`,
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self'",
  `img-src 'self' blob: data: ${YANDEX_MAPS_API_ORIGIN} ${YANDEX_MAPS_STATIC_ORIGIN} ${YANDEX_MAPS_TILE_ORIGIN}`,
  "media-src 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${YANDEX_MAPS_API_ORIGIN} ${YANDEX_MAPS_STATIC_ORIGIN}`,
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join('; ')

export const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
] as const
