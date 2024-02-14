/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_SUPPORT: boolean
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ETH_HOSTNAME_HTTP: string
  readonly VITE_REFERRAL: number
  readonly VITE_DEFENDER_RELAYER_WEBHOOK_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
