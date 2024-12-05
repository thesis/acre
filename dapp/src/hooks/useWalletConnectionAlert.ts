import { WalletConnectionAlertContext } from "#/contexts"
import { useContext } from "react"

export default function useWalletConnectionAlert() {
  return useContext(WalletConnectionAlertContext)
}
