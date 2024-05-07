import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { WalletContext } from "#/contexts"
import { UseRequestAccountReturn } from "#/types"
import { CURRENCY_ID_BITCOIN } from "#/constants"
import { fetchActivities } from "#/store/wallet"
import { logPromiseFailure } from "#/utils"
import { useWalletApiReactTransport } from "./useWalletApiReactTransport"
import { useAppDispatch } from "./store/useAppDispatch"

export function useRequestBitcoinAccount(): UseRequestAccountReturn {
  const dispatch = useAppDispatch()
  const { setBtcAccount } = useContext(WalletContext)
  const { account, requestAccount } = useRequestAccount()
  const { walletApiReactTransport } = useWalletApiReactTransport()

  useEffect(() => {
    if (account) {
      setBtcAccount(account)
      logPromiseFailure(dispatch(fetchActivities(account.address)))
    }
  }, [account, dispatch, setBtcAccount])

  const requestBitcoinAccount = useCallback(async () => {
    walletApiReactTransport.connect()
    await requestAccount({ currencyIds: [CURRENCY_ID_BITCOIN] })
    walletApiReactTransport.disconnect()
  }, [requestAccount, walletApiReactTransport])

  return { requestAccount: requestBitcoinAccount }
}
