import { WalletConnectionErrorContext } from "#/contexts"
import { useContext } from "react"

export function useWalletConnectionError() {
  return useContext(WalletConnectionErrorContext)
}
