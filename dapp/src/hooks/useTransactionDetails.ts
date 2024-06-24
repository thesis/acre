import { useEffect, useState } from "react"
import { ACTION_FLOW_TYPES, ActionFlowType, DepositFee } from "#/types"
import { initialDepositFee, useTransactionFee } from "./useTransactionFee"

type UseTransactionDetailsResult = {
  amount: bigint
  transactionFee: DepositFee
  estimatedAmount: bigint
}

const initialTransactionDetails = {
  amount: 0n,
  transactionFee: initialDepositFee,
  estimatedAmount: 0n,
}

export function useTransactionDetails(
  amount: bigint | undefined,
  flow: ActionFlowType = ACTION_FLOW_TYPES.STAKE,
) {
  // TODO: Temporary solution - Let's update when withdrawal fees are defined
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
