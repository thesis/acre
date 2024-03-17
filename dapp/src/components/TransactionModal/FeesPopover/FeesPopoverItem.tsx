import React from "react"
import { HStack } from "@chakra-ui/react"
import {
  CurrencyBalance,
  CurrencyBalanceProps,
} from "#/components/shared/CurrencyBalance"
import { TextSm } from "#/components/shared/Typography"

export type FeesItemType = CurrencyBalanceProps & {
  label: string
}

export function FeesPopoverItem({ label, amount, ...props }: FeesItemType) {
  return (
    <HStack w="100%" justifyContent="space-between">
      <TextSm color="white">{label}</TextSm>
      <CurrencyBalance
        size="sm"
        amount={amount}
        color="gold.300"
        balanceFontWeight="semibold"
        symbolFontWeight="semibold"
        {...props}
      />
    </HStack>
  )
}
