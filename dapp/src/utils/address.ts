import { BITCOIN_NETWORK } from "#/constants"
import {
  isPayToScriptHashTypeAddress,
  isPublicKeyHashTypeAddress,
} from "@acre-btc/sdk"

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-5)}`
}

// Only Native Segwit, Nested Segwit or Legacy addresses are supported by Acre.
export const isSupportedBTCAddressType = (address: string): boolean =>
  isPublicKeyHashTypeAddress(address, BITCOIN_NETWORK) ||
  isPayToScriptHashTypeAddress(address, BITCOIN_NETWORK)
