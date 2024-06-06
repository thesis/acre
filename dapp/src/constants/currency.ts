import { Currency, CurrencyType } from "#/types"

export const BITCOIN: Currency = {
  name: "Bitcoin",
  symbol: "BTC",
  decimals: 8,
  // TODO: Change when min amount of BTC will be updated
  desiredDecimals: 5,
}

export const STBTC: Currency = {
  ...BITCOIN,
  name: "stBTC",
  symbol: "stBTC",
}

export const USD: Currency = {
  name: "United States Dollar",
  symbol: "USD",
  decimals: 10,
  desiredDecimals: 2,
}

export const CURRENCY_ID_BITCOIN =
  import.meta.env.VITE_USE_TESTNET === "true" ? "bitcoin_testnet" : "bitcoin"

export const CURRENCIES_BY_TYPE: Record<CurrencyType, Currency> = {
  bitcoin: BITCOIN,
  usd: USD,
  stbtc: STBTC,
}
