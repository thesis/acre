import { PostHog, usePostHog } from "posthog-js/react"
import { useCallback } from "react"

type IdentifyArgs = Parameters<PostHog["identify"]>

export const usePostHogIdentity = () => {
  const posthog = usePostHog()

  const handleIdentification = useCallback(
    (...identifyArgs: IdentifyArgs) => {
      posthog.identify(...identifyArgs)
    },
    [posthog],
  )

  const resetIdentity = useCallback(() => {
    posthog.reset()
  }, [posthog])

  return { handleIdentification, resetIdentity }
}
