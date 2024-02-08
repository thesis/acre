import { useCallback, useEffect } from "react"
import { OnSuccessCallback } from "#/types"
import { useStakeFlow } from "#/acre-react/hooks"
import { useDepositBTCTransaction } from "./useDepositBTCTransaction"
import { useTransactionContext } from "./useTransactionContext"
import { useSendTransaction } from "./useSendTransaction"

type UseDepositBTCReturn = {
  depositBTC: () => Promise<void>
}

export function useDepositBTC(
  onSuccess?: OnSuccessCallback,
): UseDepositBTCReturn {
  const { tokenAmount } = useTransactionContext()
  const { btcAddress } = useStakeFlow()
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
