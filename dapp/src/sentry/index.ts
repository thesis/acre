import * as Sentry from "@sentry/react"
import { Primitive } from "@sentry/types"

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

const captureMessage = (
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

export default {
  initialize,
  captureException,
  captureMessage,
}
