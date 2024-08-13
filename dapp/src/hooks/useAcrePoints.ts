import { numberToLocaleString } from "#/utils"

const getFormattedAmount = (amount: number) => numberToLocaleString(amount, 0)

const DEFAULT_USERNAME = "Stacrer"

type UseAcrePointsReturnType = {
  data: {
    totalPointsAmount: number
    dailyPointsAmount: number
    claimablePointsAmount: number
    nextDropTimestamp: number
    rankPosition: number
    estimatedRankPosition: number
    userName: string
    lastClaimedTimestamp: number
  }
  formatted: {
    totalPointsAmount: string
    dailyPointsAmount: string
    claimablePointsAmount: string
  }
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const totalPointsAmount = 2749993 // TODO: Fetch from the API
  const dailyPointsAmount = 1201 // TODO: Fetch from the API
  const claimablePointsAmount = 2402 // TODO: Fetch from the API
  const nextDropTimestamp = 1634160000000 // TODO: Fetch from the API
  const rankPosition = 8724 // TODO: Fetch from the API
  const estimatedRankPosition = 2082 // TODO: Fetch from the API
  const userName = DEFAULT_USERNAME // Eventually an entry point for future implementation
  const lastClaimedTimestamp = 1634160000000 // TODO: Fetch from the API

  const formattedTotalPointsAmount = getFormattedAmount(totalPointsAmount)
  const formattedDailyPointsAmount = getFormattedAmount(dailyPointsAmount)
  const formattedClaimablePointsAmount = getFormattedAmount(
    claimablePointsAmount,
  )

  return {
    data: {
      totalPointsAmount,
      dailyPointsAmount,
      claimablePointsAmount,
      nextDropTimestamp,
      rankPosition,
      estimatedRankPosition,
      userName,
      lastClaimedTimestamp,
    },
    formatted: {
      totalPointsAmount: formattedTotalPointsAmount,
      dailyPointsAmount: formattedDailyPointsAmount,
      claimablePointsAmount: formattedClaimablePointsAmount,
    },
  }
}
