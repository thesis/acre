const USE_TESTNET = import.meta.env.VITE_USE_TESTNET === "true"

const SENTRY_SUPPORT = import.meta.env.VITE_SENTRY_SUPPORT === "true"

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

const ETH_HOSTNAME_HTTP = import.meta.env.VITE_ETH_HOSTNAME_HTTP

const REFERRAL = import.meta.env.VITE_REFERRAL

const TBTC_API_ENDPOINT = import.meta.env.VITE_TBTC_API_ENDPOINT

const GELATO_RELAY_API_KEY = import.meta.env.VITE_GELATO_RELAY_API_KEY

export default {
  USE_TESTNET,
  SENTRY_SUPPORT,
  SENTRY_DSN,
  ETH_HOSTNAME_HTTP,
  REFERRAL,
  TBTC_API_ENDPOINT,
  GELATO_RELAY_API_KEY,
}
