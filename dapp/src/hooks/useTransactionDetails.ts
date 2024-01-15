import { useEffect, useState } from "react"

type UseTransactionDetailsResult = {
  btcAmount: string
  protocolFee: string
  estimatedAmount: string
}

export function useTransactionDetails(amount: bigint | undefined) {
  const [details, setDetails] = useState<
    UseTransactionDetailsResult | undefined
  >(undefined)

  useEffect(() => {
    if (!amount) {
      setDetails(undefined)
    } else {
      const protocolFee = amount / 10000n
      const estimatedAmount = amount - protocolFee

      setDetails({
        btcAmount: amount.toString(),
        protocolFee: protocolFee.toString(),
        estimatedAmount: estimatedAmount.toString(),
      })
    }
  }, [amount])

  return details
}
