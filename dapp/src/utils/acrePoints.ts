import { ACRE_POINTS_REWARDS_MULTIPLERS } from "#/constants"
import { AcrePointsClaimTier } from "#/types"

const estimateRewardAmountPerTier = (
  baseReward: number,
  tier: AcrePointsClaimTier,
) => {
  const multipler = ACRE_POINTS_REWARDS_MULTIPLERS[tier]
  return baseReward * multipler
}

export default {
  estimateRewardAmountPerTier,
}
