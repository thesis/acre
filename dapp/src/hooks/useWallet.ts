import { useMemo } from "react"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./useRequestBitcoinAccount"

export function useWallet() {
  const { btcAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()

  return useMemo(
    () => ({
      bitcoin: {
        account: btcAccount,
        requestAccount: async () => {
          await requestBitcoinAccount()
        },
      },
    }),
    [btcAccount, requestBitcoinAccount],
  )
}
