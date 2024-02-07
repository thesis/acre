import { useCallback } from "react"
import {
  OnErrorCallback,
  OnSuccessCallback,
  TRANSACTION_STATUSES,
} from "#/types"
import { useTransactionContext } from "./useTransactionContext"

type UseSendTransactionReturn = {
  sendTransaction: () => Promise<void>
}

export function useSendTransaction<
  F extends (...args: never[]) => Promise<void>,
>(
  fn: F,
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseSendTransactionReturn {
  const { setStatus } = useTransactionContext()

  const handleSendTransaction = useCallback(
    async (...args: Parameters<typeof fn>) => {
      try {
        setStatus(TRANSACTION_STATUSES.PENDING)
        await fn(...args)

        setStatus(TRANSACTION_STATUSES.SUCCEEDED)
        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        setStatus(TRANSACTION_STATUSES.FAILED)
        if (onError) {
          onError(error)
        }
        console.error(error)
      }
    },
    [fn, onError, onSuccess, setStatus],
  )

  return { sendTransaction: handleSendTransaction }
}
