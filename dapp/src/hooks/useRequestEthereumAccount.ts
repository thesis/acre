import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { CURRENCY_ID_ETHEREUM } from "../constants"
import { UseRequestAccountReturn } from "../types"
import { WalletContext } from "../contexts"

export function useRequestEthereumAccount(): UseRequestAccountReturn {
  const walletContext = useContext(WalletContext)
  const { account, requestAccount } = useRequestAccount()

  useEffect(() => {
    walletContext?.setEthAccount(account || undefined)
  }, [account, walletContext])

  const requestEthereumAccount = useCallback(async () => {
    await requestAccount({ currencyIds: [CURRENCY_ID_ETHEREUM] })
  }, [requestAccount])

  return { requestAccount: requestEthereumAccount }
}
