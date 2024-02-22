export type Currency = {
  name: string
  symbol: string
  decimals: number
  desiredDecimals: number
  fixedPointDecimals?: number
}

export type CurrencyType = "bitcoin" | "ethereum" | "usd" | "stbtc"
