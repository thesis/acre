import { useEffect } from "react"
import { MODAL_TYPES } from "#/types"
import { useWallet } from "../useWallet"
import { useModal } from "../useModal"

export function useAccountsChangedUnisat() {
  const { isConnected, address, onDisconnect } = useWallet()
  const { openModal } = useModal()

  useEffect(() => {
    const provider = window.unisat

    if (!provider) return undefined

    const handleAccountsChanged = (accounts: string[]) => {
      if (isConnected && accounts.length === 0) {
        onDisconnect()
      } else if (isConnected && address !== accounts[0]) {
        onDisconnect()
        openModal(MODAL_TYPES.CONNECT_WALLET)
      }
    }
    provider.on("accountsChanged", handleAccountsChanged)

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [address, isConnected, onDisconnect, openModal])
}
