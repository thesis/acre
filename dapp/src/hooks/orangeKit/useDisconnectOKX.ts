import { useEffect } from "react"
import { useWallet } from "../useWallet"

const isOkxWalletEnabled =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

export function useDisconnectOKX() {
  const { onDisconnect } = useWallet()

  useEffect(() => {
    const provider = window?.okxwallet?.bitcoin

    if (!provider || !isOkxWalletEnabled) return undefined

    provider.on("disconnect", onDisconnect)

    return () => {
      provider.removeListener("disconnect", onDisconnect)
    }
  }, [onDisconnect])
}
