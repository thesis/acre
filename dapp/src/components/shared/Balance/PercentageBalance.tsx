import React, { useMemo } from "react"
import { formatPercentage } from "#/utils"
import { BalanceProps } from "#/types"
import { BalanceBox } from "./BalanceBox"

export function PercentageBalance({
  currency,
  amount,
  size,
  variant,
  balanceFontWeight,
  symbolFontWeight,
  ...textProps
}: BalanceProps) {
  const balance = useMemo(() => {
    const value = amount ?? 0
    return formatPercentage(+value)
  }, [amount])

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
