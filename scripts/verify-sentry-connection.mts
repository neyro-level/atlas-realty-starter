import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN
const environment = process.env.APP_ENV
const release = process.env.RELEASE_SHA
if (!dsn) throw new Error('SENTRY_DSN is required for the controlled Sentry check')
if (!environment) throw new Error('APP_ENV is required for the controlled Sentry check')
if (!release || release === 'local') throw new Error('An exact non-local RELEASE_SHA is required for the controlled Sentry check')

Sentry.init({
  dsn,
  enabled: true,
  environment,
  release,
  sendDefaultPii: false,
  tracesSampleRate: 0,
})

const eventId = Sentry.captureException(new Error('Controlled AMS Sentry connectivity check'), {
  tags: {
    check: 'controlled-connectivity',
    release,
  },
})
const flushed = await Sentry.flush(10_000)
if (!flushed) throw new Error('Sentry did not flush the controlled test event within 10 seconds')
console.log(JSON.stringify({ environment, eventId, release, sent: true }))
await Sentry.close(2_000)
