import * as Sentry from '@sentry/nextjs'
import { sentryServerEnvironment } from './src/project/sentry-server-env'

Sentry.init({
  dsn: sentryServerEnvironment.dsn,
  enabled: Boolean(sentryServerEnvironment.dsn),
  environment: sentryServerEnvironment.environment,
  release: sentryServerEnvironment.release,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
})
