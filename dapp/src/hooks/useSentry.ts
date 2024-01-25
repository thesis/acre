import { initializeSentry } from "#/sdk/sentry"
import { useEffect } from "react"

export const useSentry = () => {
  useEffect(() => {
    const { VITE_SENTRY_SUPPORT, VITE_SENTRY_DSN } = import.meta.env

    if (VITE_SENTRY_SUPPORT) {
      initializeSentry(`${VITE_SENTRY_DSN}`)
    }
  }, [])
}
