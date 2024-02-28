import { initializeSentry } from "#/sentry"
import { useEffect } from "react"

export const useSentry = () => {
  useEffect(() => {
    const { VITE_SENTRY_SUPPORT, VITE_SENTRY_DSN } = import.meta.env

    if (VITE_SENTRY_SUPPORT === "true") {
      initializeSentry(VITE_SENTRY_DSN)
    }
  }, [])
}
