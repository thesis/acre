import { Account, WalletAPIClient } from "@ledgerhq/wallet-api-client"
import { useRequestAccount } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useContext, useEffect } from "react"
import { LedgerLiveAppContext } from "../contexts/LedgerLiveAppContext"
import { CURRENCY_ID_BITCOIN } from "../constants"

type UseRequestAccount = {
  pending: boolean
  account: Account | null
  error: unknown
}

type RequestAccountParams = Parameters<WalletAPIClient["account"]["request"]>

type UseRequestAccountReturn = {
  requestAccount: (...params: RequestAccountParams) => Promise<void>
} & UseRequestAccount

export function useRequestBitcoinAccount(): UseRequestAccountReturn {
  const { setBtcAccount } = useContext(LedgerLiveAppContext)
  const requestAccountResponse = useRequestAccount()
  const { account, requestAccount } = requestAccountResponse

  useEffect(() => {
    setBtcAccount(account || undefined)
  }, [account, setBtcAccount])

  const requestBitcoinAccount = useCallback(async () => {
    await requestAccount({ currencyIds: [CURRENCY_ID_BITCOIN] })
  }, [requestAccount])

  return { ...requestAccountResponse, requestAccount: requestBitcoinAccount }
}
