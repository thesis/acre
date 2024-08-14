import React, { useMemo } from "react"
import {
  Box,
  useMultiStyleConfig,
  TextProps,
  ResponsiveValue,
} from "@chakra-ui/react"
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
  size?: ResponsiveValue<string>
  variant?: ResponsiveValue<
    | "greater-balance-md"
    | "greater-balance-xl"
    | "greater-balance-xxl"
    | "unstyled"
  >
  symbolPosition?: "prefix" | "suffix"
  withDots?: boolean
  balanceTextProps?: TextProps
  symbolTextProps?: TextProps
} & TextProps

export function CurrencyBalance({
  currency,
  amount,
  shouldBeFormatted = true,
  desiredDecimals: customDesiredDecimals,
  size,
  variant,
  symbolPosition = "suffix",
  withDots = false,
  as,
  balanceTextProps,
  symbolTextProps,
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
        __css={styles.balance}
        {...textProps}
        {...balanceTextProps}
      >
        {balance}
        {withDots && ".."}
      </Box>
      <Box as="span" __css={styles.symbol} {...textProps} {...symbolTextProps}>
        {symbol}
      </Box>
    </Box>
  )
}
