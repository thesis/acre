import { useEffect } from "react"
import { useWallet } from "../useWallet"

export function useAccountsChangedUnisat() {
  const { isConnected, onDisconnect } = useWallet()

  useEffect(() => {
    const provider = window.unisat

    if (!provider) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (isConnected && accounts.length === 0) {
        onDisconnect()
      }
    }
    provider.on("accountsChanged", handleAccountsChanged)

    // eslint-disable-next-line consistent-return
    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [isConnected, onDisconnect])
}
