import { useContext } from "react"
import { WalletApiReactTransportContext } from "#/contexts"

export function useWalletApiReactTransport() {
  const context = useContext(WalletApiReactTransportContext)

  if (!context) {
    throw new Error(
      "WalletApiReactTransportContext used outside of WalletApiReactTransportProvider component",
    )
  }

  return context
}
