import { PostHogEvent } from "#/posthog/events"
import { PostHog, usePostHog } from "posthog-js/react"
import { useCallback } from "react"

type CaptureArgs = [
  eventName: PostHogEvent,
  ...rest: Parameters<PostHog["capture"]> extends [unknown, ...infer R]
    ? R
    : never,
]

export const usePostHogCapture = () => {
  const posthog = usePostHog()

  const handleCapture = useCallback(
    (...captureArgs: CaptureArgs) => {
      posthog.capture(...captureArgs)
    },
    [posthog],
  )

  const handleCaptureWithCause = useCallback(
    (error: unknown, ...captureArgs: CaptureArgs) => {
      const [eventName, parameters, ...rest] = captureArgs

      const captureParameters =
        error instanceof Error
          ? {
              ...parameters,
              cause: error.message,
            }
          : undefined

      posthog.capture(eventName, captureParameters, ...rest)
    },
    [posthog],
  )

  return { handleCapture, handleCaptureWithCause }
}
