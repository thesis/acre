import { useMemo } from "react"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./useRequestBitcoinAccount"
import { useRequestEthereumAccount } from "./useRequestEthereumAccount"

export function useWallet() {
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()

  return useMemo(
    () => ({
      bitcoin: { account: btcAccount, requestAccount: requestBitcoinAccount },
      ethereum: { account: ethAccount, requestAccount: requestEthereumAccount },
    }),
    [btcAccount, requestBitcoinAccount, ethAccount, requestEthereumAccount],
  )
}
