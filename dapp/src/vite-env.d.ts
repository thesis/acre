/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ETH_HOSTNAME_HTTP: string
  readonly VITE_REFERRAL: number
  readonly VITE_TBTC_API_ENDPOINT: string
  readonly VITE_GELATO_RELAY_API_KEY: string
  readonly VITE_FEATURE_FLAG_GAMIFICATION_ENABLED: string
  readonly VITE_FEATURE_FLAG_WITHDRAWALS_ENABLED: string
  readonly VITE_FEATURE_FLAG_OKX_WALLET_ENABLED: string
  readonly VITE_FEATURE_FLAG_XVERSE_WALLET_ENABLED: string
  readonly VITE_FEATURE_FLAG_BEEHIVE_COMPONENT_ENABLED: string
  readonly VITE_SUBGRAPH_API_KEY: string
  readonly VITE_LATEST_COMMIT_HASH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface InjectedProvider {
  on(
    eventName: "accountsChanged" | "disconnect" | "accountChanged",
    callback: (payload: any) => void,
  ): void
  removeListener(
    eventName: "accountsChanged" | "disconnect" | "accountChanged",
    callback: (payload: any) => void,
  ): void
}

interface Window {
  unisat?: InjectedProvider
  okxwallet?: { bitcoin: InjectedProvider }
}
