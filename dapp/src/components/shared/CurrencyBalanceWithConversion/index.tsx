import React, { useMemo } from "react"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"
import { ZERO_AMOUNT } from "../../../constants"

const MOCK_CONVERSION_AMOUNT = 100

export function CurrencyBalanceWithConversion({
  from,
  to,
}: {
  from: CurrencyBalanceProps
  to: CurrencyBalanceProps
}) {
  // TODO: Make the correct conversion
  const conversionAmount = useMemo(() => {
    if (!from.amount || BigInt(from.amount) < ZERO_AMOUNT) return undefined

    return MOCK_CONVERSION_AMOUNT
  }, [from.amount])

  return (
    <>
      <CurrencyBalance {...from} />
      <CurrencyBalance
        amount={conversionAmount}
        shouldBeFormatted={false}
        {...to}
      />
    </>
  )
}
