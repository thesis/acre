import React, { createContext, useMemo, useState } from "react"
import { TokenAmount } from "../types"

type TransactionContextValue = {
  tokenAmount?: TokenAmount
  seTokenAmount: React.Dispatch<React.SetStateAction<TokenAmount | undefined>>
}

export const TransactionContext = createContext<TransactionContextValue>({
  tokenAmount: undefined,
  seTokenAmount: () => {},
})

export function TransactionContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [tokenAmount, seTokenAmount] = useState<TokenAmount | undefined>(
    undefined,
  )

  const contextValue: TransactionContextValue =
    useMemo<TransactionContextValue>(
      () => ({
        tokenAmount,
        seTokenAmount,
      }),
      [tokenAmount],
    )

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  )
}
