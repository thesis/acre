import { featureFlags } from "#/constants"
import { PostHog } from "posthog-js"
import { usePostHog as usePostHogClient } from "posthog-js/react"
import { useEffect } from "react"

export const usePostHogCapture = (
  ...captureArgs: Parameters<PostHog["capture"]>
) => {
  const postHog = usePostHogClient()

  useEffect(() => {
    if (!featureFlags.POSTHOG_ENABLED) return
    postHog.capture(...captureArgs)
  }, [postHog, captureArgs])
}
