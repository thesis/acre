import React, { useMemo } from "react"
import {
  formatTokenAmount,
  getCurrencyByType,
  numberToLocaleString,
} from "#/utils"
import { BalanceProps } from "#/types"
import { BalanceBox } from "./BalanceBox"

export function CurrencyBalance({
  currency,
  amount,
  shouldBeFormatted = true,
  desiredDecimals: customDesiredDecimals,
  size,
  variant,
  balanceFontWeight,
  symbolFontWeight,
  ...textProps
}: BalanceProps) {
  const { decimals, desiredDecimals: currencyDesiredDecimals } =
    getCurrencyByType(currency)
  const desiredDecimals = customDesiredDecimals ?? currencyDesiredDecimals

  const balance = useMemo(() => {
    const value = amount ?? 0

    if (shouldBeFormatted)
      return formatTokenAmount(value, decimals, desiredDecimals)

    return numberToLocaleString(value, desiredDecimals)
  }, [amount, decimals, desiredDecimals, shouldBeFormatted])

  return (
    <BalanceBox
      amount={balance}
      currency={currency}
      size={size}
      variant={variant}
      balanceFontWeight={balanceFontWeight}
      symbolFontWeight={symbolFontWeight}
      {...textProps}
    />
  )
}
