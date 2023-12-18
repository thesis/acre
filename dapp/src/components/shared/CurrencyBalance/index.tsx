import React, { useMemo } from "react"
import { Box, useMultiStyleConfig, TextProps } from "@chakra-ui/react"
import { formatTokenAmount, toLocaleString } from "../../../utils"
import { CurrencyType } from "../../../types"
import { CURRENCIES_BY_TYPE } from "../../../constants"

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

  const currency = CURRENCIES_BY_TYPE[currencyType]

  const balance = useMemo(() => {
    if (shouldBeFormatted)
      return formatTokenAmount(amount ?? 0, currency.decimals, desiredDecimals)

    if (typeof amount === "number") {
      return toLocaleString(amount)
    }

    return amount
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
