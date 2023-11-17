import { Account } from "@ledgerhq/wallet-api-client"
import React, { createContext, useMemo, useState } from "react"

type LedgerLiveAppContextValue = {
  btcAccount: Account | undefined
  setBtcAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
  ethAccount: Account | undefined
  setEthAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
}

export const LedgerLiveAppContext = createContext<LedgerLiveAppContextValue>({
  btcAccount: undefined,
  setBtcAccount: () => {},
  ethAccount: undefined,
  setEthAccount: () => {},
})

export function LedgerLiveAppProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [btcAccount, setBtcAccount] = useState<Account | undefined>(undefined)
  const [ethAccount, setEthAccount] = useState<Account | undefined>(undefined)

  const contextValue: LedgerLiveAppContextValue =
    useMemo<LedgerLiveAppContextValue>(
      () => ({
        btcAccount,
        setBtcAccount,
        ethAccount,
        setEthAccount,
      }),
      [btcAccount, setBtcAccount, ethAccount, setEthAccount],
    )

  return (
    <LedgerLiveAppContext.Provider value={contextValue}>
      {children}
    </LedgerLiveAppContext.Provider>
  )
}
