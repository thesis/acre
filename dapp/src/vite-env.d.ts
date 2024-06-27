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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface InjectedProvider {
  on(eventName: "accountsChanged", callback: (payload: any) => void): void
  removeListener(
    eventName: "accountsChanged",
    callback: (payload: any) => void,
  ): void
}

interface Window {
  unisat?: InjectedProvider
}
