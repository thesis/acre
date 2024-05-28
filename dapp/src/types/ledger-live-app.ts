import { Account, WalletAPIClient } from "@ledgerhq/wallet-api-client"

export type RequestAccountParams = Parameters<
  WalletAPIClient["account"]["request"]
>

export type UseRequestAccountReturn = {
  account: Account | null
  requestAccount: (...params: RequestAccountParams) => Promise<void>
}
