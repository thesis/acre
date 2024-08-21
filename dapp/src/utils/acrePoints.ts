import { ACRE_POINTS_REWARDS_MULTIPLERS } from "#/constants"
import { AcrePointsClaimTier } from "#/types"
import { numberToLocaleString } from "./numbers"

const estimateRewardAmountPerTier = (
  baseReward: number,
  tier: AcrePointsClaimTier,
) => {
  const multipler = ACRE_POINTS_REWARDS_MULTIPLERS[tier]
  return baseReward * multipler
}

const getFormattedAmount = (amount: number) => numberToLocaleString(amount, 0)

export default {
  estimateRewardAmountPerTier,
  getFormattedAmount,
}
