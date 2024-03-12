import React from "react"
import { Box, useMultiStyleConfig } from "@chakra-ui/react"
import { getCurrencyByType } from "#/utils"
import { BalanceProps } from "#/types"

export function BalanceBox({
  currency,
  amount,
  size,
  variant,
  balanceFontWeight = "bold",
  symbolFontWeight = "bold",
  ...textProps
}: BalanceProps) {
  const styles = useMultiStyleConfig("CurrencyBalance", { size, variant })
  const { symbol } = getCurrencyByType(currency)

  return (
    <Box>
      <Box
        as="span"
        fontWeight={balanceFontWeight}
        __css={styles.balance}
        {...textProps}
      >
        {amount}
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
