import * as Sentry from "@sentry/react"

export const initializeSentry = (dsn: string) => {
  Sentry.init({
    dsn,
    integrations: [new Sentry.BrowserTracing()],
    // Performance Monitoring
    // TODO: Now, it's capturing 100% of the transactions. It should be changed when prod mode is enabled
    tracesSampleRate: 1.0,
  })
}
