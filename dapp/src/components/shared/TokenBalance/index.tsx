import React from "react"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"

type TokenBalanceProps = {
  token: CurrencyBalanceProps
  fiatCurrency: CurrencyBalanceProps
}

export function TokenBalance({ token, fiatCurrency }: TokenBalanceProps) {
  return (
    <>
      <CurrencyBalance {...token} />
      <CurrencyBalance {...fiatCurrency} />
    </>
  )
}
