import React, { useMemo } from "react"
import { Box, useMultiStyleConfig, TextProps } from "@chakra-ui/react"
import { formatTokenAmount, numberToLocaleString } from "../../../utils"
import { CurrencyType } from "../../../types"
import { CURRENCIES_BY_TYPE } from "../../../constants"

export type CurrencyBalanceProps = {
  currencyType: CurrencyType
  amount?: string | number
  shouldBeFormatted?: boolean
  desiredDecimals?: number
  size?: string
  variant?: "greater-balance"
  withBrackets?: boolean
} & TextProps

export function CurrencyBalance({
  currencyType,
  amount,
  shouldBeFormatted = true,
  desiredDecimals = 2,
  size,
  variant,
  withBrackets,
  ...textProps
}: CurrencyBalanceProps) {
  const styles = useMultiStyleConfig("CurrencyBalance", { size, variant })

  const currency = CURRENCIES_BY_TYPE[currencyType]

  const balance = useMemo(() => {
    const value = amount ?? 0
    if (shouldBeFormatted)
      return formatTokenAmount(value, currency.decimals, desiredDecimals)

    return numberToLocaleString(value, desiredDecimals)
  }, [amount, currency, desiredDecimals, shouldBeFormatted])

  return (
    <Box __css={styles.balance}>
      {withBrackets && "("}
      <Box as="span" __css={styles.balance} {...textProps}>
        {balance}
      </Box>
      <Box as="span" __css={styles.symbol} {...textProps}>
        {currency.symbol}
      </Box>
      {withBrackets && ")"}
    </Box>
  )
}
