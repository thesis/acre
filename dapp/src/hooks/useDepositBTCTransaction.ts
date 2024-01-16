import { useCallback } from "react"
import { OnSuccessCallback } from "#/types"

export function useDepositBTCTransaction(onSuccess?: OnSuccessCallback) {
  // TODO: sending transactions using the SDK
  const depositBTC = useCallback(() => {
    if (onSuccess) {
      // FIXME: enable eslint rule when SDK ready
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(onSuccess, 1000)
    }
  }, [onSuccess])

  return { depositBTC }
}
