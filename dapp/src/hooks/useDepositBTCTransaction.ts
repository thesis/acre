import { useCallback } from "react"
import { OnSuccessCallback } from "#/types"

export function useDepositBTCTransaction(onSuccess?: OnSuccessCallback) {
  // TODO: sending transactions using the SDK
  const depositBTC = useCallback(() => {
    if (onSuccess) {
      // FIXME: enable eslint rule when SDK ready
      setTimeout(onSuccess, 1000)
    }
  }, [onSuccess])

  return { depositBTC }
}
