import React, { useMemo } from "react"
import { HStack, HeadingProps, TextProps } from "@chakra-ui/react"
import { formatTokenAmount, toLocaleString } from "../../../utils"
import { Currency } from "../../../types"
import { TextMd } from "../Typography"

type TypographyTag = (props: TextProps) => JSX.Element
type TypographyProps = TextProps | HeadingProps

type CurrencyBalanceProps = {
  currency: Currency
  amount?: string | number
  shouldBeFormatted?: boolean
  desiredDecimals?: number
  balanceTag?: TypographyTag
  symbolTag?: TypographyTag
  balanceProps?: TypographyProps
  symbolProps?: TypographyProps
}

export function CurrencyBalance({
  currency,
  amount,
  shouldBeFormatted = true,
  desiredDecimals = 2,
  balanceTag: BalanceTag = TextMd,
  symbolTag: SymbolTag = TextMd,
  balanceProps,
  symbolProps,
}: CurrencyBalanceProps) {
  const balance = useMemo(() => {
    if (shouldBeFormatted)
      return formatTokenAmount(amount ?? 0, currency.decimals, desiredDecimals)

    if (typeof amount === "number") {
      return toLocaleString(amount)
    }

    return amount
  }, [amount, currency, desiredDecimals, shouldBeFormatted])

  return (
    <HStack>
      <BalanceTag {...balanceProps}>{balance}</BalanceTag>
      <SymbolTag {...symbolProps}>{currency.symbol}</SymbolTag>
    </HStack>
  )
}
