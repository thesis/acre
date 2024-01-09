import { useEffect, useState } from "react"
import { ZERO_AMOUNT } from "../constants"

export function useTransactionDetails(amount: bigint): {
  protocolFee: string
  estimatedAmount: string
} {
  const [protocolFee, setProtocolFee] = useState<bigint>(ZERO_AMOUNT)
  const [estimatedAmount, setEstimatedAmount] = useState<bigint>(ZERO_AMOUNT)

  useEffect(() => {
    if (amount <= ZERO_AMOUNT) {
      setProtocolFee(ZERO_AMOUNT)
      setEstimatedAmount(ZERO_AMOUNT)
    } else {
      const newProtocolFee = amount / 10000n
      setProtocolFee(newProtocolFee)
      setEstimatedAmount(amount - newProtocolFee)
    }
  }, [amount])

  return {
    protocolFee: protocolFee.toString(),
    estimatedAmount: estimatedAmount.toString(),
  }
}
