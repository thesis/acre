/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_SUPPORT: boolean
  readonly VITE_SENTRY_DSN: string
  readonly VITE_TESTNET_ETHEREUM_NETWORK: "goerli" | "sepolia"
  readonly VITE_ETH_HOSTNAME_HTTP: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
