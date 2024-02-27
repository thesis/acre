import React from "react"
import { useCurrencyConversion } from "#/hooks"
import { CurrencyConversionType } from "#/types"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"

export function CurrencyBalanceWithConversion({
  from,
  to,
}: {
  from: CurrencyBalanceProps
  to: CurrencyBalanceProps
}) {
  const conversionAmount = useCurrencyConversion(
    from as CurrencyConversionType,
    to as CurrencyConversionType,
  )

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
