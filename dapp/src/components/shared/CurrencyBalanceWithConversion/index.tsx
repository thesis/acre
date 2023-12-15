import React from "react"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"

export function CurrencyBalanceWithConversion({
  from,
  to,
}: {
  from: CurrencyBalanceProps
  to: CurrencyBalanceProps
}) {
  return (
    <>
      <CurrencyBalance {...from} />
      <CurrencyBalance {...to} />
    </>
  )
}
