import { WalletConnectionAlertContext } from "#/contexts"
import { useContext } from "react"

export function useWalletConnectionAlert() {
  return useContext(WalletConnectionAlertContext)
}
