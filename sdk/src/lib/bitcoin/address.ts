import {
  BitcoinAddressConverter,
  BitcoinNetwork,
  BitcoinScriptUtils,
} from "@keep-network/tbtc-v2.ts"

/**
 * Checks if the address is of type P2PKH or P2WPKH.
 * @param address The address to be checked.
 * @param network The network for which the check will be done.
 */
// eslint-disable-next-line import/prefer-default-export
export const isPublicKeyHashTypeAddress = (
  address: string,
  network: BitcoinNetwork,
): boolean => {
  try {
    const outputScript = BitcoinAddressConverter.addressToOutputScript(
      address,
      network,
    )

    return (
      BitcoinScriptUtils.isP2PKHScript(outputScript) ||
      BitcoinScriptUtils.isP2WPKHScript(outputScript)
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return false
  }
}
