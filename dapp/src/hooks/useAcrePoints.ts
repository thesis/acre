const DEFAULT_USERNAME = "Stacrer"

type UseAcrePointsReturnType = {
  totalPointsAmount: number
  dailyPointsAmount: number
  claimablePointsAmount: number
  nextDropTimestamp: number
  rankPosition: number
  estimatedRankPosition: number
  userName: string
  userId: number
  lastClaimedTimestamp: number
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const totalPointsAmount = 2749993 // TODO: Fetch from the API
  const dailyPointsAmount = 1201 // TODO: Fetch from the API
  const claimablePointsAmount = 2402 // TODO: Fetch from the API
  const nextDropTimestamp = 1634160000000 // TODO: Fetch from the API
  const rankPosition = 2082 // TODO: Fetch from the API
  const estimatedRankPosition = 2085 // TODO: Fetch from the API
  const userName = DEFAULT_USERNAME // Eventually an entry point for future implementation
  const userId = 8724 // TODO: Fetch from the API
  const lastClaimedTimestamp = 1634160000000 // TODO: Fetch from the API

  return {
    totalPointsAmount,
    dailyPointsAmount,
    claimablePointsAmount,
    nextDropTimestamp,
    rankPosition,
    estimatedRankPosition,
    userName,
    userId,
    lastClaimedTimestamp,
  }
}
