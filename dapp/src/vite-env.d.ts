/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ETH_HOSTNAME_HTTP: string
  readonly VITE_REFERRAL: number
  readonly VITE_DEFENDER_RELAYER_WEBHOOK_URL: string
  readonly VITE_SUBGRAPH_DEVELOPMENT_URL: string
  readonly VITE_SUBGRAPH_LOCALHOST_URL: string
  readonly VITE_SUBGRAPH_PRODUCTION_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
