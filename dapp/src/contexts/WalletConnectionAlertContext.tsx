import { ConnectionAlertData } from "#/types"
import React, { createContext, useCallback, useMemo, useState } from "react"

type WalletConnectionAlertContextValue = {
  connectionAlert: ConnectionAlertData | undefined
  setConnectionAlert: (data: ConnectionAlertData) => void
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
  const [connectionAlert, setConnectionAlert] = useState<ConnectionAlertData>()

  const resetConnectionAlert = useCallback(
    () => setConnectionAlert(undefined),
    [setConnectionAlert],
  )

  const contextValue: WalletConnectionAlertContextValue =
    useMemo<WalletConnectionAlertContextValue>(
      () => ({
        connectionAlert,
        setConnectionAlert,
        resetConnectionAlert,
      }),
      [connectionAlert, resetConnectionAlert, setConnectionAlert],
    )

  return (
    <WalletConnectionAlertContext.Provider value={contextValue}>
      {children}
    </WalletConnectionAlertContext.Provider>
  )
}
