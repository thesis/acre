import { useEffect, useState } from "react"
import { ACTION_FLOW_TYPES, ActionFlowType, Fee } from "#/types"
import { initialFee, useTransactionFee } from "./useTransactionFee"

type UseTransactionDetailsResult = {
  amount: bigint
  transactionFee: Fee
  estimatedAmount: bigint
}

const initialTransactionDetails = {
  amount: 0n,
  transactionFee: initialFee,
  estimatedAmount: 0n,
}

export function useTransactionDetails(
  amount: bigint | undefined,
  flow: ActionFlowType = ACTION_FLOW_TYPES.STAKE,
) {
  const transactionFee = useTransactionFee(amount, flow)
  const [details, setDetails] = useState<UseTransactionDetailsResult>(
    initialTransactionDetails,
  )

  useEffect(() => {
    if (!amount) {
      setDetails(initialTransactionDetails)
    } else {
      const estimatedAmount = amount - transactionFee.total

      setDetails({
        amount,
        transactionFee,
        estimatedAmount,
      })
    }
  }, [amount, transactionFee])

  return details
}
