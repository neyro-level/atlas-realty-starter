import * as Sentry from '@sentry/nextjs'

export async function register() {
  // Next.js selects one runtime per process; static imports would bundle the Node config into Edge.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
