import React from "react"
import { Box, Icon, useMultiStyleConfig } from "@chakra-ui/react"
import { CurrencyType } from "#/types"
import { BTCIcon, stBTCIcon } from "#/assets/icons"
import { getCurrencyByType } from "#/utils"

const ICONS: Partial<Record<CurrencyType, typeof Icon>> = {
  bitcoin: BTCIcon,
  stbtc: stBTCIcon,
}

type CurrencyIconProps = {
  currency: CurrencyType
  withSymbol?: boolean
}

export default function CurrencyIcon({
  currency,
  withSymbol,
}: CurrencyIconProps) {
  const styles = useMultiStyleConfig("CurrencyIcon")
  const { symbol } = getCurrencyByType(currency)
  const icon = ICONS[currency]

  if (!icon) return null

  return (
    <Box __css={styles.container}>
      <Icon as={icon} boxSize={6} />
      {withSymbol && (
        <Box as="span" __css={styles.symbol}>
          {symbol}
        </Box>
      )}
    </Box>
  )
}
