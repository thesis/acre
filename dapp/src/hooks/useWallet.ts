import { useMemo } from "react"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./useRequestBitcoinAccount"

export function useWallet() {
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()

  return useMemo(
    () => ({
      bitcoin: {
        account: btcAccount,
        requestAccount: async () => {
          await requestBitcoinAccount()
        },
      },
      ethereum: { account: ethAccount },
    }),
    [btcAccount, ethAccount, requestBitcoinAccount],
  )
}
