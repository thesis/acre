import { useCallback } from "react"
import { OnSuccessCallback } from "#/types"
import { useStakeFlow } from "#/acre-react/hooks"

type UseSignMessageReturn = {
  signMessage: () => Promise<void>
}

export function useSignMessage(
  onSuccess?: OnSuccessCallback,
): UseSignMessageReturn {
  const { signMessage } = useStakeFlow()

  const handleSignMessage = useCallback(async () => {
    try {
      await signMessage()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
    }
  }, [onSuccess, signMessage])

  return { signMessage: handleSignMessage }
}
