import { env } from "#/constants"
import { initializeSentry } from "#/sentry"
import { useEffect } from "react"

export const useSentry = () => {
  useEffect(() => {
    if (env.SENTRY_SUPPORT) {
      initializeSentry(env.SENTRY_DSN)
    }
  }, [])
}
