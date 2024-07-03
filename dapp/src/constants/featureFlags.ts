const GAMIFICATION_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_GAMIFICATION_ENABLED === "true"

const OKX_WALLET_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

const featureFlags = {
  GAMIFICATION_ENABLED,
  OKX_WALLET_ENABLED,
}

export default featureFlags
