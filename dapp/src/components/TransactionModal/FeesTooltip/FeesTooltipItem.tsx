import React from "react"
import { ListItem } from "@chakra-ui/react"
import {
  CurrencyBalance,
  CurrencyBalanceProps,
} from "#/components/shared/CurrencyBalance"
import { TextSm } from "#/components/shared/Typography"

export type FeesItemType = CurrencyBalanceProps & {
  label: string
}

export function FeesTooltipItem({ label, amount, ...props }: FeesItemType) {
  return (
    <ListItem display="flex" justifyContent="space-between">
      <TextSm color="white">{label}</TextSm>
      <CurrencyBalance
        size="sm"
        amount={amount}
        color="gold.300"
        balanceFontWeight="semibold"
        symbolFontWeight="semibold"
        {...props}
      />
    </ListItem>
  )
}
