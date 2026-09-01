import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.APP_ENV ?? process.env.NODE_ENV,
  release: process.env.RELEASE_SHA,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
})
