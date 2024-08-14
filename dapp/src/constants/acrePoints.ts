import { AcrePointsClaimTier } from "#/types"

export const ACRE_POINTS_REWARDS_MULTIPLERS: Record<
  AcrePointsClaimTier,
  number
> = {
  WEEKLY: 7,
  MONTHLY: 30,
  YEARLY: 365,
}

export const ACRE_POINTS_TIER_LABELS: Record<AcrePointsClaimTier, string> = {
  WEEKLY: "Per week",
  MONTHLY: "Per month",
  YEARLY: "Per year",
}
