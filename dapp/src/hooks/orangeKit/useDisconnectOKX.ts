import { useEffect } from "react"
import { featureFlags } from "#/constants"
import { useWallet } from "../useWallet"

export function useDisconnectOKX() {
  const { onDisconnect } = useWallet()

  useEffect(() => {
    const provider = window?.okxwallet?.bitcoin

    if (!provider || !featureFlags.OKX_WALLET_ENABLED) return undefined

    provider.on("disconnect", onDisconnect)

    return () => {
      provider.removeListener("disconnect", onDisconnect)
    }
  }, [onDisconnect])
}
