import { ConnectionErrorData } from "#/types"
import React, { createContext, useCallback, useMemo, useState } from "react"

type WalletConnectionErrorContextValue = {
  connectionError: ConnectionErrorData | undefined
  setConnectionError: (data: ConnectionErrorData) => void
  resetConnectionError: () => void
}

export const WalletConnectionErrorContext =
  createContext<WalletConnectionErrorContextValue>(
    {} as WalletConnectionErrorContextValue,
  )

export function WalletConnectionErrorContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [connectionError, setConnectionError] = useState<ConnectionErrorData>()

  const resetConnectionError = useCallback(
    () => setConnectionError(undefined),
    [setConnectionError],
  )

  const contextValue: WalletConnectionErrorContextValue =
    useMemo<WalletConnectionErrorContextValue>(
      () => ({
        connectionError,
        setConnectionError,
        resetConnectionError,
      }),
      [connectionError, resetConnectionError, setConnectionError],
    )

  return (
    <WalletConnectionErrorContext.Provider value={contextValue}>
      {children}
    </WalletConnectionErrorContext.Provider>
  )
}
