export const BITCOIN = {
  name: "Bitcoin",
  token: "BTC",
}

export const CURRENCY_ID_BITCOIN =
  import.meta.env.VITE_USE_TESTNET === "true" ? "bitcoin_testnet" : "bitcoin"

export const CURRENCY_ID_ETHEREUM =
  import.meta.env.VITE_USE_TESTNET === "true" ? "ethereum_goerli" : "ethereum"
