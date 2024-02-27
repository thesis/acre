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
      const { VITE_SENTRY_SUPPORT } = import.meta.env

      if (VITE_SENTRY_SUPPORT === "false") return
      captureMessage(message, params, tags)
    },
    [],
  )
