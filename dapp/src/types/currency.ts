export type Currency = {
  name: string
  symbol: string
  decimals: number
  desiredDecimals: number
}

export type CurrencyType = "bitcoin" | "usd" | "stbtc" | "mats"

export type AmountType = string | number | bigint
