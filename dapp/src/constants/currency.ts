import { Currency, CurrencyType } from "#/types"
import { EthereumNetwork } from "@acre-btc/sdk"
import { ETHEREUM_NETWORK } from "./chains"
import { BITCOIN_DESIRED_DECIMALS } from "./staking"

export const BITCOIN: Currency = {
  name: "Bitcoin",
  symbol: "BTC",
  decimals: 8,
  desiredDecimals: BITCOIN_DESIRED_DECIMALS,
}

export const STBTC: Currency = {
  ...BITCOIN,
  name: "stBTC",
  symbol: "stBTC",
}

export const ETHEREUM: Currency = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  desiredDecimals: 2,
}

export const USD: Currency = {
  name: "United States Dollar",
  symbol: "USD",
  decimals: 10,
  desiredDecimals: 2,
}

const CURRENCY_ID_BY_ETHEREUM_NETWORK: Record<EthereumNetwork, string> = {
  mainnet: "ethereum",
  sepolia: "ethereum_sepolia",
}

export const CURRENCY_ID_BITCOIN =
  import.meta.env.VITE_USE_TESTNET === "true" ? "bitcoin_testnet" : "bitcoin"

export const CURRENCY_ID_ETHEREUM =
  CURRENCY_ID_BY_ETHEREUM_NETWORK[ETHEREUM_NETWORK]

export const CURRENCIES_BY_TYPE: Record<CurrencyType, Currency> = {
  bitcoin: BITCOIN,
  ethereum: ETHEREUM,
  usd: USD,
  stbtc: STBTC,
}
