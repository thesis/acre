import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { WalletContext } from "#/contexts"
import { UseRequestAccountReturn } from "#/types"
import { CURRENCY_ID_ETHEREUM } from "#/constants"

export function useRequestEthereumAccount(): UseRequestAccountReturn {
  const { setEthAccount } = useContext(WalletContext)
  const { account, requestAccount } = useRequestAccount()

  useEffect(() => {
    if (account) {
      setEthAccount(account)
    }
  }, [account, setEthAccount])

  const requestEthereumAccount = useCallback(async () => {
    await requestAccount({ currencyIds: [CURRENCY_ID_ETHEREUM] })
  }, [requestAccount])

  return { requestAccount: requestEthereumAccount }
}
