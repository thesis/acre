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
        // TODO: Temporary solution - Uncomment when we find a solution
        // The `handleAccountsChanged` function runs even when a user
        // disconnects from the dApp level. Then when the user is disconnected
        // and the `onDisconnect` is called again unisat will open a wallet window.
        // onDisconnect()
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
