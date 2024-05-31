/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ETH_HOSTNAME_HTTP: string
  readonly VITE_REFERRAL: number
  readonly VITE_TBTC_API_ENDPOINT: string
  readonly VITE_TBTC_API_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
