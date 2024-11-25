import * as Sentry from "@sentry/react"

const initialize = (dsn: string) => {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.captureConsoleIntegration({ levels: ["error"] }),
      Sentry.extraErrorDataIntegration(),
      Sentry.httpClientIntegration(),
    ],
    // Attach stacktrace to errors logged by `console.error`. This is useful for
    // the `captureConsoleIntegration` integration.
    attachStacktrace: true,
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
