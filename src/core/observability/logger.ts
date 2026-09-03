import { randomUUID } from 'node:crypto'

import pino, { type DestinationStream, type Logger, type LoggerOptions } from 'pino'

export const LOG_REDACTION_PATHS = [
  'authorization',
  'cookie',
  'cookies',
  'password',
  'token',
  'secret',
  'phone',
  'email',
  'ownerContact',
  'apartmentNumber',
  'cadastralNumber',
  'req.headers.authorization',
  'req.headers.cookie',
  'request.headers.authorization',
  'request.headers.cookie',
  '*.authorization',
  '*.cookie',
  '*.cookies',
  '*.password',
  '*.token',
  '*.secret',
  '*.phone',
  '*.email',
  '*.ownerContact',
  '*.apartmentNumber',
  '*.cadastralNumber',
] as const

const loggerOptions: LoggerOptions = {
  base: undefined,
  level: 'info',
  redact: {
    censor: '[REDACTED]',
    paths: [...LOG_REDACTION_PATHS],
  },
}
export function createLogger(destination?: DestinationStream): Logger {
  return destination ? pino(loggerOptions, destination) : pino(loggerOptions)
}

export const logger = createLogger()

export function createRequestLogger(correlationID: string = randomUUID()) {
  return logger.child({ correlationId: normalizeCorrelationID(correlationID) })
}

export function normalizeCorrelationID(value: string | null | undefined) {
  return value && /^[A-Za-z0-9._:-]{1,128}$/.test(value) ? value : randomUUID()
}
