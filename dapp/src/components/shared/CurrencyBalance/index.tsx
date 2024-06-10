import React, { useMemo } from "react"
import { Box, useMultiStyleConfig, TextProps } from "@chakra-ui/react"
import {
  formatTokenAmount,
  getCurrencyByType,
  numberToLocaleString,
} from "#/utils"
import { CurrencyType, AmountType } from "#/types"

export type CurrencyBalanceProps = {
  currency: CurrencyType
  amount?: AmountType
  shouldBeFormatted?: boolean
  desiredDecimals?: number
  size?: string
  variant?:
    | "greater-balance-lg"
    | "greater-balance-xl"
    | "greater-balance-xxl"
    | "unstyled"
  balanceFontWeight?: string
  symbolFontWeight?: string
  symbolPosition?: "prefix" | "suffix"
} & TextProps

export function CurrencyBalance({
  currency,
  amount,
  shouldBeFormatted = true,
  desiredDecimals: customDesiredDecimals,
  size,
  variant,
  balanceFontWeight = "bold",
  symbolFontWeight = "bold",
  symbolPosition = "suffix",
  as,
  ...textProps
}: CurrencyBalanceProps) {
  const styles = useMultiStyleConfig("CurrencyBalance", {
    size,
    variant,
    symbolPosition,
  })

  const {
    symbol,
    decimals,
    desiredDecimals: currencyDesiredDecimals,
  } = getCurrencyByType(currency)
  const desiredDecimals = customDesiredDecimals ?? currencyDesiredDecimals

  const balance = useMemo(() => {
    const value = amount ?? 0
    if (shouldBeFormatted || typeof value === "bigint")
      return formatTokenAmount(value, decimals, desiredDecimals)

    return numberToLocaleString(value, desiredDecimals)
  }, [amount, decimals, desiredDecimals, shouldBeFormatted])

  return (
    <Box as={as} __css={styles.container}>
      <Box
        as="span"
        fontWeight={balanceFontWeight}
        __css={styles.balance}
        {...textProps}
      >
        {balance}
      </Box>
      <Box
        as="span"
        fontWeight={symbolFontWeight}
        __css={styles.symbol}
        {...textProps}
      >
        {symbol}
      </Box>
    </Box>
  )
}
