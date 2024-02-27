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

export const captureMessage = (
  message: string,
  params?: { [key: string]: unknown },
  tags?: { [key: string]: string },
) => {
  Sentry.withScope((scope) => {
    if (params) {
      scope.setExtras(params)
    }

    if (tags) {
      scope.setTags(tags)
    }

    Sentry.captureMessage(message)
  })
}
