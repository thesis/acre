import React, { createContext, useMemo } from "react"
import { WindowMessageTransport } from "@ledgerhq/wallet-api-client"

const getWalletAPITransport = (): WindowMessageTransport =>
  new WindowMessageTransport()

export const walletApiReactTransport = getWalletAPITransport()

interface TransportContextValue {
  walletApiReactTransport: WindowMessageTransport
}

export const WalletApiReactTransportContext =
  createContext<TransportContextValue>({
    walletApiReactTransport,
  })

export function WalletApiReactTransportProvider({
  children,
}: {
  children: React.ReactElement
}): JSX.Element {
  const walletApiReactTransportValue = useMemo(
    () => ({
      walletApiReactTransport,
    }),
    [],
  )
  return (
    <WalletApiReactTransportContext.Provider
      value={walletApiReactTransportValue}
    >
      {children}
    </WalletApiReactTransportContext.Provider>
  )
}
