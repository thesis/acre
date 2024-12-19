import { useEffect } from "react"
import { MODAL_TYPES } from "#/types"
import { featureFlags } from "#/constants"
import useWallet from "../useWallet"
import useModal from "../useModal"

export default function useAccountChangedOKX() {
  const { isConnected, address, onDisconnect } = useWallet()
  const { openModal } = useModal()

  useEffect(() => {
    const provider = window?.okxwallet?.bitcoin

    if (!provider || !featureFlags.OKX_WALLET_ENABLED) return undefined

    const handleAccountChanged = (
      addressInfo: {
        address: string
        publicKey: string
        compressedPublicKey: string
      } | null,
    ) => {
      if (isConnected && address !== addressInfo?.address) {
        onDisconnect()
        openModal(MODAL_TYPES.CONNECT_WALLET)
      }
    }
    provider.on("accountChanged", handleAccountChanged)

    return () => {
      provider.removeListener("accountChanged", handleAccountChanged)
    }
  }, [address, isConnected, onDisconnect, openModal])
}
