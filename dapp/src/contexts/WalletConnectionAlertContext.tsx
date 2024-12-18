import { ConnectionAlert } from "#/components/ConnectWalletModal/ConnectWalletAlert"
import React, { createContext, useCallback, useMemo, useState } from "react"

type WalletConnectionAlertContextValue = {
  type?: ConnectionAlert
  setConnectionAlert: (type: ConnectionAlert) => void
  resetConnectionAlert: () => void
}

export const WalletConnectionAlertContext =
  createContext<WalletConnectionAlertContextValue>(
    {} as WalletConnectionAlertContextValue,
  )

export function WalletConnectionAlertContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [type, setType] = useState<ConnectionAlert>()

  const resetConnectionAlert = useCallback(() => {
    setType(undefined)
  }, [setType])

  const setConnectionAlert = useCallback(
    (connectionAlert: ConnectionAlert) => {
      setType(connectionAlert)
    },
    [setType],
  )

  const contextValue: WalletConnectionAlertContextValue =
    useMemo<WalletConnectionAlertContextValue>(
      () => ({
        type,
        setConnectionAlert,
        resetConnectionAlert,
      }),
      [resetConnectionAlert, setConnectionAlert, type],
    )

  return (
    <WalletConnectionAlertContext.Provider value={contextValue}>
      {children}
    </WalletConnectionAlertContext.Provider>
  )
}
