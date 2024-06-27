import { useEffect } from "react"
import { MODAL_TYPES } from "#/types"
import { useWallet } from "../useWallet"
import { useModal } from "../useModal"

const isOkxWalletEnabled =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

export function useAccountChangedOKX() {
  const { isConnected, address, onDisconnect } = useWallet()
  const { openModal } = useModal()

  useEffect(() => {
    const provider = window?.okxwallet?.bitcoin

    if (!provider || !isOkxWalletEnabled) return

    const handleAccountChanged = (addressInfo: {
      address: string
      publicKey: string
      compressedPublicKey: string
    }) => {
      if (isConnected && address !== addressInfo.address) {
        onDisconnect()
        openModal(MODAL_TYPES.CONNECT_WALLET)
      }
    }
    provider.on("accountChanged", handleAccountChanged)

    // eslint-disable-next-line consistent-return
    return () => {
      provider.removeListener("accountChanged", handleAccountChanged)
    }
  }, [address, isConnected, onDisconnect, openModal])
}
