import React, { createContext, useMemo, useState } from "react"

type TransactionContextValue = {
  amount?: string
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const TransactionContext = createContext<TransactionContextValue>({
  amount: undefined,
  setAmount: () => {},
})

export function TransactionContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [amount, setAmount] = useState<string | undefined>(undefined)

  const contextValue: TransactionContextValue =
    useMemo<TransactionContextValue>(
      () => ({
        amount,
        setAmount,
      }),
      [amount],
    )

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  )
}
