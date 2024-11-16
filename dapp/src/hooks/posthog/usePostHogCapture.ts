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

  return handleCapture
}
