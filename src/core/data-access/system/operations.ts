export const SYSTEM_OPERATIONS = [
  'bootstrap-first-owner',
  'business-audit',
  'import-job-failure',
  'lead-retention',
] as const

export type SystemOperation = (typeof SYSTEM_OPERATIONS)[number]

export function systemContext(operation: SystemOperation) {
  return { systemOperation: operation }
}
