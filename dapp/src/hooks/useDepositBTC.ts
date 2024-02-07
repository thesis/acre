import { useCallback } from "react"
import { OnSuccessCallback } from "#/types"
import { useStakeFlow } from "#/acre-react/hooks"
import { useDepositBTCTransaction } from "./useDepositBTCTransaction"
import { useTransactionContext } from "./useTransactionContext"
import { useSendTransaction } from "./useSendTransaction"

type UseDepositBTCReturn = {
  errorMessage?: string
  depositBTC: () => Promise<void>
}

export function useDepositBTC(
  onSuccess?: OnSuccessCallback,
): UseDepositBTCReturn {
  const { tokenAmount } = useTransactionContext()
  const { btcAddress, stake } = useStakeFlow()
  const { sendBitcoinTransaction } = useDepositBTCTransaction()

  const handleDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress) return

    await sendBitcoinTransaction(tokenAmount.amount, btcAddress)
    // Temporary solution, ultimately, we will not be calling stake transaction here
    await stake()
  }, [btcAddress, sendBitcoinTransaction, stake, tokenAmount?.amount])

  const { sendTransaction } = useSendTransaction(handleDepositBTC, onSuccess)

  return { depositBTC: sendTransaction }
}
