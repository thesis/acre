import { ConnectionAlert } from "#/components/ConnectWalletModal/ConnectWalletAlert"
import { AlertStatus } from "@chakra-ui/react"
import React, { createContext, useCallback, useMemo, useState } from "react"

type WalletConnectionAlertContextValue = {
  type?: ConnectionAlert
  status: AlertStatus
  setConnectionAlert: (type: ConnectionAlert, status?: AlertStatus) => void
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
  const [status, setStatus] = useState<AlertStatus>("error")

  const resetConnectionAlert = useCallback(() => {
    setType(undefined)
    setStatus("error")
  }, [setType])

  const setConnectionAlert = useCallback(
    (connectionAlert: ConnectionAlert, alertStatus: AlertStatus = "error") => {
      setType(connectionAlert)
      setStatus(alertStatus)
    },
    [setType],
  )

  const contextValue: WalletConnectionAlertContextValue =
    useMemo<WalletConnectionAlertContextValue>(
      () => ({
        type,
        status,
        setConnectionAlert,
        resetConnectionAlert,
      }),
      [resetConnectionAlert, setConnectionAlert, status, type],
    )

  return (
    <WalletConnectionAlertContext.Provider value={contextValue}>
      {children}
    </WalletConnectionAlertContext.Provider>
  )
}
