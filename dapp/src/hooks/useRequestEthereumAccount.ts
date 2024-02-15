import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { WalletContext } from "#/contexts"
import { UseRequestAccountReturn } from "#/types"
import { CURRENCY_ID_ETHEREUM } from "#/constants"
import { useWalletApiReactTransport } from "./useWalletApiReactTransport"

export function useRequestEthereumAccount(): UseRequestAccountReturn {
  const { setEthAccount } = useContext(WalletContext)
  const { account, requestAccount } = useRequestAccount()
  const { walletApiReactTransport } = useWalletApiReactTransport()

  useEffect(() => {
    if (account) {
      setEthAccount(account)
    }
  }, [account, setEthAccount])

  const requestEthereumAccount = useCallback(async () => {
    walletApiReactTransport.connect()
    await requestAccount({ currencyIds: [CURRENCY_ID_ETHEREUM] })
    walletApiReactTransport.disconnect()
  }, [requestAccount, walletApiReactTransport])

  return { requestAccount: requestEthereumAccount }
}
