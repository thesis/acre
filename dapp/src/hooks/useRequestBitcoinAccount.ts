import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { CURRENCY_ID_BITCOIN } from "../constants"
import { UseRequestAccountReturn } from "../types"
import { WalletContext } from "../contexts"

export function useRequestBitcoinAccount(): UseRequestAccountReturn {
  const { setBtcAccount } = useContext(WalletContext)
  const { account, requestAccount } = useRequestAccount()

  useEffect(() => {
    if (account) {
      setBtcAccount(account)
    }
  }, [account, setBtcAccount])

  const requestBitcoinAccount = useCallback(async () => {
    await requestAccount({ currencyIds: [CURRENCY_ID_BITCOIN] })
  }, [requestAccount])

  return { requestAccount: requestBitcoinAccount }
}
