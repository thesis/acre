import { useEffect } from "react"
import { useWallet } from "../useWallet"

const isOkxWalletEnabled =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

export function useDisconnectOKX() {
  const { onDisconnect } = useWallet()

  useEffect(() => {
    const provider = window?.okxwallet?.bitcoin

    if (!provider || !isOkxWalletEnabled) return

    provider.on("disconnect", onDisconnect)

    // eslint-disable-next-line consistent-return
    return () => {
      provider.removeListener("disconnect", onDisconnect)
    }
  }, [onDisconnect])
}
