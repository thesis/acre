import { PostHog, usePostHog } from "posthog-js/react"
import { useCallback } from "react"
import { sha256, toUtf8Bytes } from "ethers"

type IdentifyArgs = Parameters<PostHog["identify"]>

export const usePostHogIdentity = () => {
  const posthog = usePostHog()

  const handleIdentification = useCallback(
    (...identifyArgs: IdentifyArgs) => {
      const [id, ...rest] = identifyArgs
      if (!id) return

      const hashedId = sha256(toUtf8Bytes(id.toLowerCase())).slice(2, 12)

      posthog.identify(hashedId, ...rest)
    },
    [posthog],
  )

  const resetIdentity = useCallback(() => {
    posthog.reset()
  }, [posthog])

  return { handleIdentification, resetIdentity }
}
