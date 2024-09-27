import { useEffect } from "react"
import { featureFlags } from "#/constants"
import { useWallet } from "../useWallet"

export function useAccountsChangedOKX() {
  const { isConnected, onDisconnect } = useWallet()

  useEffect(() => {
    const provider = window?.okxwallet?.bitcoin

    if (!provider || !featureFlags.OKX_WALLET_ENABLED) return undefined

    const handleAccountsChanged = (accounts: string) => {
      if (isConnected && accounts.length === 0) {
        onDisconnect()
      }
    }

    provider.on("accountsChanged", handleAccountsChanged)

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [isConnected, onDisconnect])
}
