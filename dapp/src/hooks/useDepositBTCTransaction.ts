import { useCallback } from "react"
import { OnSuccessCallback } from "#/types"
import { useModalFlowContext } from "./useModalFlowContext"

export function useDepositBTCTransaction(onSuccess?: OnSuccessCallback) {
  const { endTransactionProcess } = useModalFlowContext()
  // TODO: sending transactions using the SDK
  const depositBTC = useCallback(() => {
    if (onSuccess) {
      endTransactionProcess()
      setTimeout(onSuccess, 1000)
    }
  }, [onSuccess, endTransactionProcess])

  return { depositBTC }
}
