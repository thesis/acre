import React from "react"
import { WalletAPIProvider } from "@ledgerhq/wallet-api-client-react"
import {
  WalletApiReactTransportProvider,
  walletApiReactTransport,
} from "./WalletApiReactTransportProvider"

export function LedgerWalletAPIProvider({
  children,
}: {
  children: React.ReactElement
}): JSX.Element {
  return (
    <WalletAPIProvider transport={walletApiReactTransport}>
      <WalletApiReactTransportProvider>
        {children}
      </WalletApiReactTransportProvider>
    </WalletAPIProvider>
  )
}
