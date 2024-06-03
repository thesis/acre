const GAMIFICATION_ENABLED =
  import.meta.env.VITE_FEATURE_FLAG_GAMIFICATION_ENABLED === "true"

export const featureFlags = {
  GAMIFICATION_ENABLED,
}
