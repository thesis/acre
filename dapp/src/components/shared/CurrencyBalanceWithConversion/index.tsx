import React from "react"
import { useCurrencyConversion } from "#/hooks"
import { BalanceProps } from "#/types"
import { CurrencyBalance } from "../Balance/CurrencyBalance"

export function CurrencyBalanceWithConversion({
  from,
  to,
}: {
  from: BalanceProps
  to: BalanceProps
}) {
  const conversionAmount = useCurrencyConversion({ from, to })

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
