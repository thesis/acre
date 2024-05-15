import { Account } from "@ledgerhq/wallet-api-client"
import React, { createContext, useEffect, useMemo, useState } from "react"

type WalletContextValue = {
  btcAccount: Account | undefined
  setBtcAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
  ethAccount: string | undefined
  setEthAccount: React.Dispatch<React.SetStateAction<string | undefined>>
  isConnected: boolean
}

export const WalletContext = createContext<WalletContextValue>({
  ethAccount: undefined,
  btcAccount: undefined,
  isConnected: false,
  setEthAccount: () => {},
  setBtcAccount: () => {},
})

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [btcAccount, setBtcAccount] = useState<Account | undefined>(undefined)
  const [ethAccount, setEthAccount] = useState<string | undefined>(undefined)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    setIsConnected(!!(btcAccount && ethAccount))
  }, [btcAccount, ethAccount])

  const contextValue: WalletContextValue = useMemo<WalletContextValue>(
    () => ({
      btcAccount,
      setBtcAccount,
      ethAccount,
      setEthAccount,
      isConnected,
    }),
    [btcAccount, setBtcAccount, ethAccount, setEthAccount, isConnected],
  )

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}
