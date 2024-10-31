const GAMIFICATION_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_GAMIFICATION_ENABLED === "true"

const OKX_WALLET_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

const XVERSE_WALLET_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_XVERSE_WALLET_ENABLED === "true"

const WITHDRAWALS_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_WITHDRAWALS_ENABLED === "true"

const BEEHIVE_COMPONENT_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_BEEHIVE_COMPONENT_ENABLED === "true"

const ACRE_POINTS_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_ACRE_POINTS_ENABLED === "true"

const TVL_ENABLED = import.meta.env.VITE_FEATURE_FLAG_TVL_ENABLED === "true"

const GATING_DAPP_ENABLED =
  import.meta.env.VITE_FEATURE_GATING_DAPP_ENABLED === "true"

const featureFlags = {
  GAMIFICATION_ENABLED,
  OKX_WALLET_ENABLED,
  XVERSE_WALLET_ENABLED,
  WITHDRAWALS_ENABLED,
  BEEHIVE_COMPONENT_ENABLED,
  ACRE_POINTS_ENABLED,
  TVL_ENABLED,
  GATING_DAPP_ENABLED,
}

export default featureFlags
