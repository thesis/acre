const userKeys = {
  all: ["user"] as const,
  balance: () => [...userKeys.all, "balance"] as const,
  position: () => [...userKeys.all, "position"] as const,
  claimedAcrePoints: () => [...userKeys.all, "claimed-acre-points"] as const,
}

const acreKeys = {
  all: ["acre"] as const,
  totalAssets: () => [...acreKeys.all, "total-assets"] as const,
  mats: () => [...acreKeys.all, "mats"] as const,
  pointsData: () => [...acreKeys.all, "points-data"] as const,
}

export default {
  userKeys,
  acreKeys,
}
