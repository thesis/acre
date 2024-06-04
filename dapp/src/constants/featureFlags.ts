const GAMIFICATION_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_GAMIFICATION_ENABLED === "true"

const featureFlags = {
  GAMIFICATION_ENABLED,
}

export default featureFlags
