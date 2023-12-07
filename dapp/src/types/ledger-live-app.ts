import { WalletAPIClient } from "@ledgerhq/wallet-api-client"

export type RequestAccountParams = Parameters<WalletAPIClient["account"]["request"]>

export type UseRequestAccountReturn = {
  requestAccount: (...params: RequestAccountParams) => Promise<void>
}
