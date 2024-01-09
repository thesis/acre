import React, { useMemo } from "react"
import { Box, useMultiStyleConfig, TextProps } from "@chakra-ui/react"
import {
  formatTokenAmount,
  getCurrencyByType,
  isCurrencyType,
  numberToLocaleString,
} from "../../../utils"
import { Currency, CurrencyType } from "../../../types"

export type CurrencyBalanceProps = {
  currency: Currency | CurrencyType
  amount?: string | number
  shouldBeFormatted?: boolean
  desiredDecimals?: number
  size?: string
  variant?: "greater-balance"
} & TextProps

export function CurrencyBalance({
  currency,
  amount,
  shouldBeFormatted = true,
  desiredDecimals = 2,
  size,
  variant,
  ...textProps
}: CurrencyBalanceProps) {
  const styles = useMultiStyleConfig("CurrencyBalance", { size, variant })

  const { symbol, decimals } = isCurrencyType(currency)
    ? getCurrencyByType(currency)
    : currency

  const balance = useMemo(() => {
    const value = amount ?? 0
    if (shouldBeFormatted)
      return formatTokenAmount(value, decimals, desiredDecimals)

    return numberToLocaleString(value, desiredDecimals)
  }, [amount, decimals, desiredDecimals, shouldBeFormatted])

  return (
    <Box>
      <Box as="span" __css={styles.balance} {...textProps}>
        {balance}
      </Box>
      <Box as="span" __css={styles.symbol} {...textProps}>
        {symbol}
      </Box>
    </Box>
  )
}
