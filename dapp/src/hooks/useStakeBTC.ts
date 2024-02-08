import { useCallback } from "react"
import { OnErrorCallback, OnSuccessCallback } from "#/types"
import { useStakeFlow } from "#/acre-react/hooks"
import { useSendTransaction } from "./useSendTransaction"

type UseStakeBTCReturn = {
  stakeBTC: () => Promise<void>
}

export function useStakeBTC(
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseStakeBTCReturn {
  const { stake } = useStakeFlow()

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
