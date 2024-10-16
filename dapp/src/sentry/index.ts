import * as Sentry from "@sentry/react"
import { Primitive } from "@sentry/types"

export const initializeSentry = (dsn: string) => {
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 0.5,
  })
}

export const captureMessage = (
  message: string,
  params?: { [key: string]: unknown },
  tags?: { [key: string]: Primitive },
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
