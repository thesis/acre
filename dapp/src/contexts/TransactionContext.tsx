import React, { createContext, useMemo, useState } from "react"
import { TokenAmount } from "~/types"

type TransactionContextValue = {
  tokenAmount?: TokenAmount
  setTokenAmount: React.Dispatch<React.SetStateAction<TokenAmount | undefined>>
}

export const TransactionContext = createContext<TransactionContextValue>({
  tokenAmount: undefined,
  setTokenAmount: () => {},
})

export function TransactionContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [tokenAmount, setTokenAmount] = useState<TokenAmount | undefined>(
    undefined,
  )

  const contextValue: TransactionContextValue =
    useMemo<TransactionContextValue>(
      () => ({
        tokenAmount,
        setTokenAmount,
      }),
      [tokenAmount],
    )

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  )
}
