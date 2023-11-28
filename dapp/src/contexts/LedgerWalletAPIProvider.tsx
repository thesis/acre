import React from "react"
import { Transport, WindowMessageTransport } from "@ledgerhq/wallet-api-client"
import { WalletAPIProvider } from "@ledgerhq/wallet-api-client-react"

function getWalletAPITransport(): Transport {
  if (typeof window === "undefined") {
    return {
      onMessage: undefined,
      send: () => {},
    }
  }

  const transport = new WindowMessageTransport()
  transport.connect()
  return transport
}

type LedgerWalletAPIProviderProps = {
  children: React.ReactElement
}

export function LedgerWalletAPIProvider({
  children,
}: LedgerWalletAPIProviderProps): JSX.Element {
  const transport = getWalletAPITransport()
  return <WalletAPIProvider transport={transport}>{children}</WalletAPIProvider>
}
