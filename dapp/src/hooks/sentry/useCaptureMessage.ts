import { useCallback } from "react"
import { captureMessage } from "#/sdk/sentry"

export const useCaptureMessage = () =>
  useCallback(
    (
      message: string,
      params?: { [key: string]: unknown },
      tags?: { [key: string]: string },
    ) => {
      if (import.meta.env.VITE_SENTRY_SUPPORT) {
        captureMessage(message, params, tags)
      }
    },
    [],
  )
