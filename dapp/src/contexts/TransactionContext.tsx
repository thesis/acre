import React, { createContext, useMemo, useState } from "react"
import { TRANSACTION_STATUSES, TokenAmount, TransactionStatus } from "#/types"

type TransactionContextValue = {
  tokenAmount?: TokenAmount
  status: TransactionStatus
  setTokenAmount: React.Dispatch<React.SetStateAction<TokenAmount | undefined>>
  setStatus: React.Dispatch<React.SetStateAction<TransactionStatus>>
}

export const TransactionContext = createContext<
  TransactionContextValue | undefined
>(undefined)

export function TransactionContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [tokenAmount, setTokenAmount] = useState<TokenAmount | undefined>(
    undefined,
  )
  const [status, setStatus] = useState<TransactionStatus>(
    TRANSACTION_STATUSES.IDLE,
  )

  const contextValue: TransactionContextValue =
    useMemo<TransactionContextValue>(
      () => ({
        tokenAmount,
        status,
        setTokenAmount,
        setStatus,
      }),
      [status, tokenAmount],
    )

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  )
}
