export const SYSTEM_OPERATIONS = [
  'bootstrap-first-owner',
  'bootstrap-krasnodar-complexes',
  'business-audit',
  'import-job-failure',
  'lead-delivery',
  'lead-intake',
  'lead-outbox',
  'lead-recovery',
  'lead-retention',
  'recover-orphaned-payload-jobs',
] as const

export type SystemOperation = (typeof SYSTEM_OPERATIONS)[number]

export function systemContext(operation: SystemOperation) {
  return { systemOperation: operation }
}
