import { useCallback, useEffect } from "react"
import { OnSuccessCallback } from "#/types"
import { useDepositBTCTransaction } from "./useDepositBTCTransaction"
import { useTransactionContext } from "./useTransactionContext"
import { useSendTransaction } from "./useSendTransaction"
import { useStakeFlowContext } from "./useStakeFlowContext"

type UseDepositBTCReturn = {
  depositBTC: () => Promise<void>
}

export function useDepositBTC(
  onSuccess?: OnSuccessCallback,
): UseDepositBTCReturn {
  const { tokenAmount } = useTransactionContext()
  const { btcAddress } = useStakeFlowContext()
  const { sendBitcoinTransaction, transactionHash } = useDepositBTCTransaction()

  useEffect(() => {
    if (transactionHash && onSuccess) {
      onSuccess()
    }
  }, [onSuccess, transactionHash])

  const handleDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress) return

    await sendBitcoinTransaction(tokenAmount.amount, btcAddress)
  }, [btcAddress, sendBitcoinTransaction, tokenAmount?.amount])

  const { sendTransaction } = useSendTransaction(handleDepositBTC)
  return { depositBTC: sendTransaction }
}
