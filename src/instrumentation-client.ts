import * as Sentry from '@sentry/nextjs'
import { publicEnvironment } from './project/public-env'

Sentry.init({
  dsn: publicEnvironment.sentryDSN,
  enabled: Boolean(publicEnvironment.sentryDSN),
  environment: publicEnvironment.appEnvironment,
  release: publicEnvironment.releaseSHA,
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
