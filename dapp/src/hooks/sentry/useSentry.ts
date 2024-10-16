import { env } from "#/constants"
import sentry from "#/sentry"
import { useEffect } from "react"

export const useSentry = () => {
  useEffect(() => {
    if (env.SENTRY_SUPPORT) {
      sentry.initialize(env.SENTRY_DSN)
    }
  }, [])
}
