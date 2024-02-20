import {
  BitcoinAddressConverter,
  BitcoinNetwork,
  BitcoinScriptUtils,
} from "@keep-network/tbtc-v2.ts"

// P2PKH, P2WPKH, P2SH, or P2WSH
// eslint-disable-next-line import/prefer-default-export
export const isPublicKeyHashTypeAddress = (
  address: string,
  network: BitcoinNetwork,
): boolean => {
  const outputScript = BitcoinAddressConverter.addressToOutputScript(
    address,
    network,
  )

  return (
    BitcoinScriptUtils.isP2PKHScript(outputScript) ||
    BitcoinScriptUtils.isP2WPKHScript(outputScript)
  )
}
