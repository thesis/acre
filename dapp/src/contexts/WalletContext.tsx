import { Account } from "@ledgerhq/wallet-api-client"
import React, { createContext, useEffect, useMemo, useState } from "react"

type WalletContextValue = {
  btcAccount: Account | undefined
  setBtcAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
  isConnected: boolean
}

export const WalletContext = createContext<WalletContextValue>({
  btcAccount: undefined,
  isConnected: false,
  setBtcAccount: () => {},
})

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [btcAccount, setBtcAccount] = useState<Account | undefined>(undefined)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    setIsConnected(!!btcAccount)
  }, [btcAccount])

  const contextValue: WalletContextValue = useMemo<WalletContextValue>(
    () => ({
      btcAccount,
      setBtcAccount,
      isConnected,
    }),
    [btcAccount, setBtcAccount, isConnected],
  )

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}
