const SUPPORT_GAMIFICATION =
  import.meta.env.VITE_FEATURE_FLAG_SUPPORT_GAMIFICATION === "true"

export const featureFlags = {
  SUPPORT_GAMIFICATION,
}
