import { Account, WalletAPIClient } from "@ledgerhq/wallet-api-client"

type UseRequestAccount = {
  pending: boolean
  account: Account | null
  error: unknown
}

type RequestAccountParams = Parameters<WalletAPIClient["account"]["request"]>

export type UseRequestAccountReturn = {
  requestAccount: (...params: RequestAccountParams) => Promise<void>
} & UseRequestAccount
