import { BITCOIN_NETWORK } from "#/constants"
import { isSupportedBTCAddressTypeByAcre } from "@acre-btc/sdk"

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-5)}`
}

// Only Native Segwit, Nested Segwit or Legacy addresses are supported by Acre.
export const isSupportedBTCAddressType = (address: string): boolean =>
  isSupportedBTCAddressTypeByAcre(address, BITCOIN_NETWORK)
