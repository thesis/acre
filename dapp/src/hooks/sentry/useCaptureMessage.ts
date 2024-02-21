import { useCallback } from "react"
import { Primitive } from "@sentry/types"
import { captureMessage } from "#/sentry"

export const useCaptureMessage = () =>
  useCallback(
    (
      message: string,
      params?: { [key: string]: unknown },
      tags?: { [key: string]: Primitive },
    ) => {
      if (!import.meta.env.VITE_SENTRY_SUPPORT) return
      captureMessage(message, params, tags)
    },
    [],
  )
