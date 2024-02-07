import { useCallback, useState } from "react"
import {
  OnErrorCallback,
  OnSuccessCallback,
  TRANSACTION_STATUSES,
  TransactionStatus,
} from "#/types"

type UseSendTransactionReturn = {
  status: TransactionStatus
  sendTransaction: () => Promise<void>
}

export function useSendTransaction<
  F extends (...args: never[]) => Promise<void>,
>(
  fn: F,
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseSendTransactionReturn {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TRANSACTION_STATUSES.IDLE,
  )

  const handleSendTransaction = useCallback(
    async (...args: Parameters<typeof fn>) => {
      try {
        setTransactionStatus(TRANSACTION_STATUSES.PENDING)
        await fn(...args)

        setTransactionStatus(TRANSACTION_STATUSES.SUCCEEDED)
        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        setTransactionStatus(TRANSACTION_STATUSES.FAILED)
        if (onError) {
          onError(error)
        }
        console.error(error)
      }
    },
    [fn, onError, onSuccess, setTransactionStatus],
  )

  return { sendTransaction: handleSendTransaction, status: transactionStatus }
}
