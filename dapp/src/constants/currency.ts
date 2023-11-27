import { Currency } from "../types"

export const BITCOIN: Currency = {
  name: "Bitcoin",
  symbol: "BTC",
  decimals: 8,
}

export const ETHEREUM: Currency = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
}

export const CURRENCY_ID_BITCOIN =
  import.meta.env.VITE_USE_TESTNET === "true" ? "bitcoin_testnet" : "bitcoin"

export const CURRENCY_ID_ETHEREUM =
  import.meta.env.VITE_USE_TESTNET === "true" ? "ethereum_goerli" : "ethereum"

export const FIAT_CURRENCY_USD = "USD"
