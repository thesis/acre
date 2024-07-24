import { BITCOIN_NETWORK, tbtc } from "#/constants"
import { isPublicKeyHashTypeAddress } from "@acre-btc/sdk"
import { useMemo } from "react"
import { useWallet } from "./useWallet"

export default function useBitcoinRecoveryAddress() {
  const { address } = useWallet()

  return useMemo(() => {
    if (!address) return undefined

    let recoveryAddress = address
    // By default the bitcoin recovery address is set to currently connected Bitcoin user address
    // but only P2PKH or P2WPKH address can be used as recovery address in tBTC v2.
    // So we are going to use default bitcoin address that should be used when user is connected
    // to other Bitcoin address type than supported by tBTC v2 network.
    if (!isPublicKeyHashTypeAddress(recoveryAddress, BITCOIN_NETWORK)) {
      recoveryAddress = tbtc.DEPOSIT_BITCOIN_RECOVERY_ADDRESS
    }

    return recoveryAddress
  }, [address])
}
