import React, { useMemo } from "react"
import { Box, useMultiStyleConfig, TextProps } from "@chakra-ui/react"
import {
  formatTokenAmount,
  getCurrencyByType,
  numberToLocaleString,
} from "../../../utils"
import { CurrencyType } from "../../../types"

export type CurrencyBalanceProps = {
  currencyType: CurrencyType
  amount?: string | number
  shouldBeFormatted?: boolean
  desiredDecimals?: number
  size?: string
  variant?: "greater-balance"
} & TextProps

export function CurrencyBalance({
  currencyType,
  amount,
  shouldBeFormatted = true,
  desiredDecimals = 2,
  size,
  variant,
  ...textProps
}: CurrencyBalanceProps) {
  const styles = useMultiStyleConfig("CurrencyBalance", { size, variant })

  const currency = getCurrencyByType(currencyType)

  const balance = useMemo(() => {
    const value = amount ?? 0
    if (shouldBeFormatted)
      return formatTokenAmount(value, currency.decimals, desiredDecimals)

    return numberToLocaleString(value, desiredDecimals)
  }, [amount, currency, desiredDecimals, shouldBeFormatted])

  return (
    <Box>
      <Box as="span" __css={styles.balance} {...textProps}>
        {balance}
      </Box>
      <Box as="span" __css={styles.symbol} {...textProps}>
        {currency.symbol}
      </Box>
    </Box>
  )
}
