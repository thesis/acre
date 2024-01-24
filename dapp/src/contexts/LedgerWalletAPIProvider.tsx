import React from "react"
import { WindowMessageTransport } from "@ledgerhq/wallet-api-client"
import { WalletAPIProvider } from "@ledgerhq/wallet-api-client-react"

function initLedgerWalletAPITransport(): WindowMessageTransport {
  const transport = new WindowMessageTransport()

  transport.connect()

  return transport
}

const transport = initLedgerWalletAPITransport()

export function getLedgerWalletAPITransport() {
  return transport
}

type LedgerWalletAPIProviderProps = {
  children: React.ReactElement
}

export function LedgerWalletAPIProvider({
  children,
}: LedgerWalletAPIProviderProps): JSX.Element {
  return (
    <WalletAPIProvider transport={getLedgerWalletAPITransport()}>
      {children}
    </WalletAPIProvider>
  )
}
