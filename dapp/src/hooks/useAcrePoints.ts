const DEFAULT_USERNAME = "Stacrer"

type UseAcrePointsReturnType = {
  totalPointsAmount: number
  dailyPointsAmount: number
  claimablePointsAmount: number
  nextDropTimestamp: number
  lastClaimedTimestamp: number
  rankPosition: number
  estimatedRankPosition: number
  userName: string
  userId: number
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const totalPointsAmount = 2749993 // TODO: Fetch from the API
  const dailyPointsAmount = 1201 // From deposit form as user input
  const claimablePointsAmount = 2402 // TODO: Fetch from the API
  const nextDropTimestamp = 1634160000000 // To be established
  const lastClaimedTimestamp = 1634160000000 // TODO: Fetch from the API
  const rankPosition = 2082 // TODO: Fetch from the API
  const estimatedRankPosition = 2085 // TODO: Fetch from the API
  const userName = DEFAULT_USERNAME // Eventually an entry point for future implementation
  const userId = 8724 // TODO: Fetch from the API

  return {
    totalPointsAmount,
    dailyPointsAmount,
    claimablePointsAmount,
    nextDropTimestamp,
    lastClaimedTimestamp,
    rankPosition,
    estimatedRankPosition,
    userName,
    userId,
  }
}
