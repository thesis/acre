const userKeys = {
  all: ["user"] as const,
  balance: () => [...userKeys.all, "balance"] as const,
  position: () => [...userKeys.all, "position"] as const,
}

const acreKeys = {
  all: ["acre"] as const,
  totalAssets: () => [...acreKeys.all, "total-assets"] as const,
  mats: () => [...acreKeys.all, "mats"] as const,
  claimedAcrePoints: () => [...acreKeys.all, "claimed-acre-points"] as const,
  claimEligibilityStatus: () =>
    [...acreKeys.all, "claim-eligibility-status"] as const,
  pointsDropTime: () => [...acreKeys.all, "points-drop-time"] as const,
}

export default {
  userKeys,
  acreKeys,
}
