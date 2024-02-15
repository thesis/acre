import { useCallback } from "react"
import { OnErrorCallback, OnSuccessCallback } from "#/types"

type UseExecuteFunctionReturn = () => Promise<void>

export function useExecuteFunction<
  F extends (...args: never[]) => Promise<void>,
>(
  fn: F,
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseExecuteFunctionReturn {
  return useCallback(
    async (...args: Parameters<typeof fn>) => {
      try {
        await fn(...args)

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        if (onError) {
          onError(error)
        }
        console.error(error)
      }
    },
    [fn, onError, onSuccess],
  )
}
