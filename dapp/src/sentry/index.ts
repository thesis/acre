import * as Sentry from "@sentry/react"

const initialize = (dsn: string) => {
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 0.1,
  })
}

const captureException = (exception: unknown) =>
  Sentry.captureException(exception)

export default {
  initialize,
  captureException,
}
