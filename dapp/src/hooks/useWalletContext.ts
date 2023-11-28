import { useContext } from "react"
import { WalletContext } from "../contexts"

export function useWalletContext() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error("WalletContext used outside of WalletContext component")
  }

  return context
}
