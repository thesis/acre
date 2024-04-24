import { useMemo } from "react"
import { ZeroAddress } from "ethers"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./useRequestBitcoinAccount"

export function useWallet() {
  const { btcAccount, ethAccount, setEthAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()

  return useMemo(
    () => ({
      bitcoin: {
        account: btcAccount,
        requestAccount: async () => {
          await requestBitcoinAccount()
          // TODO: Temporary solution - we do not need the eth account and we
          // want to create the Acre SDK w/o passing the Ethereum Account.
          setEthAccount(ZeroAddress)
        },
      },
      ethereum: { account: ethAccount },
    }),
    [btcAccount, requestBitcoinAccount, ethAccount, setEthAccount],
  )
}
