import React, { useCallback } from "react"
import {
  Box,
  useMultiStyleConfig,
  TextProps,
  ResponsiveValue,
  Tooltip,
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
  withRoundUp?: boolean
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
  withTooltip?: boolean
} & TextProps

export function CurrencyBalance({
  currency,
  amount,
  shouldBeFormatted = true,
  withRoundUp = false,
  desiredDecimals: customDesiredDecimals,
  size,
  variant,
  symbolPosition = "suffix",
  withDots = false,
  as,
  balanceTextProps,
  symbolTextProps,
  withTooltip = false,
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

  const getBalance = useCallback(
    (desiredDecimals: number) => {
      const value = amount ?? 0
      if (shouldBeFormatted || typeof value === "bigint")
        return formatTokenAmount(value, decimals, desiredDecimals, withRoundUp)

      return numberToLocaleString(value, desiredDecimals)
    },
    [amount, decimals, shouldBeFormatted, withRoundUp],
  )

  const content = (
    <Box as={as} __css={styles.container}>
      <Box
        as="span"
        __css={styles.balance}
        {...textProps}
        {...balanceTextProps}
      >
        {getBalance(customDesiredDecimals ?? currencyDesiredDecimals)}
        {withDots && "..."}
      </Box>
      <Box as="span" __css={styles.symbol} {...textProps} {...symbolTextProps}>
        {symbol}
      </Box>
    </Box>
  )

  if (withTooltip) {
    const fullPrecisionDecimals = (amount ?? 0).toString().length
    const tooltipLabel = `${getBalance(fullPrecisionDecimals)} ${symbol}`

    return (
      <Tooltip label={tooltipLabel} shouldWrapChildren>
        {content}
      </Tooltip>
    )
  }

  return content
}
