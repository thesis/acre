import { Account, WalletAPIClient } from "@ledgerhq/wallet-api-client"
import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { LedgerLiveAppContext } from "../contexts/LedgerLiveAppContext"
import { CURRENCY_ID_ETHEREUM } from "../constants"

type UseRequestAccount = {
  pending: boolean
  account: Account | null
  error: unknown
}

type RequestAccountParams = Parameters<WalletAPIClient["account"]["request"]>

type UseRequestAccountReturn = {
  requestAccount: (...params: RequestAccountParams) => Promise<void>
} & UseRequestAccount

export function useRequestEthereumAccount(): UseRequestAccountReturn {
  const { setEthAccount } = useContext(LedgerLiveAppContext)
  const requestAccountResponse = useRequestAccount()
  const { account, requestAccount } = requestAccountResponse

  useEffect(() => {
    setEthAccount(account || undefined)
  }, [account, setEthAccount])

  const requestEthereumAccount = useCallback(async () => {
    await requestAccount({ currencyIds: [CURRENCY_ID_ETHEREUM] })
  }, [requestAccount])

  return { ...requestAccountResponse, requestAccount: requestEthereumAccount }
}
