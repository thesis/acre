import { useCallback } from "react"
import { OnErrorCallback, OnSuccessCallback } from "#/types"
import { useSendTransaction } from "./useSendTransaction"
import { useStakeFlowContext } from "./useStakeFlowContext"

type UseStakeBTCReturn = {
  stakeBTC: () => Promise<void>
}

export function useStakeBTC(
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseStakeBTCReturn {
  const { stake } = useStakeFlowContext()

  const handleStakeBTC = useCallback(async () => {
    await stake()
  }, [stake])

  const { sendTransaction } = useSendTransaction(
    handleStakeBTC,
    onSuccess,
    onError,
  )
  return { stakeBTC: sendTransaction }
}
