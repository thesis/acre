import * as Sentry from "@sentry/react"

export const initializeSentry = (dsn: string) => {
  Sentry.init({
    dsn,
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost"],
      }),
    ],
    // Performance Monitoring
    // Capture 100% of the transactions
    tracesSampleRate: 1.0,
  })
}
