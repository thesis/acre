import { env } from "#/constants"
import sentry from "#/sentry"
import { useEffect } from "react"

const useSentry = () => {
  useEffect(() => {
    if (env.SENTRY_SUPPORT) {
      sentry.initialize(env.SENTRY_DSN)
    }
  }, [])
}

export default useSentry
