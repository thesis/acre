import { useCallback } from "react"
import { useAcreContext } from "./useAcreContext"

export default function useInitializeWithdraw() {
  const { acre } = useAcreContext()

  return useCallback(
    async (amount: bigint) => {
      if (!acre) return

      await acre.account.initializeWithdrawal(amount)
    },
    [acre],
  )
}
