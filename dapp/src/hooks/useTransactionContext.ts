import { useContext } from "react"
import { TransactionContext } from "../contexts"

export function useTransactionContext() {
  const context = useContext(TransactionContext)

  if (!context) {
    throw new Error(
      "TransactionContext used outside of TransactionContext component",
    )
  }

  return context
}
