import { Account } from "@ledgerhq/wallet-api-client"
import React, { createContext, useMemo, useState } from "react"

type WalletContextValue = {
  btcAccount: Account | undefined
  setBtcAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
  ethAccount: Account | undefined
  setEthAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
}

export const WalletContext = createContext<WalletContextValue>({
  ethAccount: undefined,
  btcAccount: undefined,
  setEthAccount: () => {},
  setBtcAccount: () => {},
})

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [btcAccount, setBtcAccount] = useState<Account | undefined>(undefined)
  const [ethAccount, setEthAccount] = useState<Account | undefined>(undefined)

  const contextValue: WalletContextValue = useMemo<WalletContextValue>(
    () => ({
      btcAccount,
      setBtcAccount,
      ethAccount,
      setEthAccount,
    }),
    [btcAccount, ethAccount],
  )

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}
