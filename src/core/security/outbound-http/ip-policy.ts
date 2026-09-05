import { isIP } from 'node:net'

export function isPublicAddress(value: string) {
  const family = isIP(value)
  if (family === 4) return isPublicIPv4(value)
  if (family === 6) return isPublicIPv6(value)
  return false
}

function isPublicIPv4(value: string) {
  const [a, b] = value.split('.').map(Number)
  if (a === 0 || a === 10 || a === 127) return false
  if (a === 169 && b === 254) return false
  if (a === 172 && b! >= 16 && b! <= 31) return false
  if (a === 192 && b === 168) return false
  if (a === 100 && b! >= 64 && b! <= 127) return false
  if (a === 198 && (b === 18 || b === 19)) return false
  if (a! >= 224) return false
  return true
}

function isPublicIPv6(value: string) {
  const normalized = value.toLowerCase()
  if (normalized === '::' || normalized === '::1') return false
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return false
  if (/^fe[89ab]/.test(normalized)) return false
  if (normalized.startsWith('ff')) return false
  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  return mapped ? isPublicIPv4(mapped[1]!) : true
}
