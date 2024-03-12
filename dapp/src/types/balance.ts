import { TextProps } from "@chakra-ui/react"
import { CurrencyType } from "./currency"

export type BalanceProps = {
  currency: CurrencyType
  amount?: string | number
  shouldBeFormatted?: boolean
  desiredDecimals?: number
  size?: string
  variant?: "greater-balance-xl" | "greater-balance-xxl"
  balanceFontWeight?: string
  symbolFontWeight?: string
} & TextProps
