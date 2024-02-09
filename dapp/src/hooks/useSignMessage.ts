import { useCallback } from "react"
import { OnSuccessCallback } from "#/types"
import { useStakeFlowContext } from "./useStakeFlowContext"

type UseSignMessageReturn = {
  signMessage: () => Promise<void>
}

export function useSignMessage(
  onSuccess?: OnSuccessCallback,
): UseSignMessageReturn {
  const { signMessage } = useStakeFlowContext()

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
