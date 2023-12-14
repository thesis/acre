import React from "react"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"

export function CurrencyBalanceWithConversion({
  token,
  fiatCurrency,
}: {
  token: CurrencyBalanceProps
  fiatCurrency: CurrencyBalanceProps
}) {
  return (
    <>
      <CurrencyBalance {...token} />
      <CurrencyBalance {...fiatCurrency} />
    </>
  )
}
