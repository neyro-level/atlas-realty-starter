import type { Payload } from 'payload'

import { bootstrapComplexes } from '@/core/data-access/system/bootstrap/krasnodar-complexes'
import { KRASNODAR_COMPLEXES, KRASNODAR_COMPLEXES_SOURCE } from '@/project/krasnodar-complexes'

type BootstrapOptions = {
  allowExisting?: boolean
  refresh?: boolean
}

export function bootstrapKrasnodarComplexes(payload: Payload, options: BootstrapOptions = {}) {
  return bootstrapComplexes(payload, KRASNODAR_COMPLEXES_SOURCE, KRASNODAR_COMPLEXES, options)
}
