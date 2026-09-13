import { z } from 'zod'

const hostnameSchema = z.string().regex(
  /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
  'Outbound allowlist entries must be exact hostnames',
)

export function readHostAllowlist(value: string | undefined) {
  if (!value) return []
  return [...new Set(value.split(',').map((host) => hostnameSchema.parse(host.trim().toLowerCase())).filter(Boolean))]
}
