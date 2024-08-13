import { numberToLocaleString } from "#/utils"

const FORMATTED_DECIMALS = 0
const getFormattedAmount = (amount: number) =>
  numberToLocaleString(amount, FORMATTED_DECIMALS)

type UseAcrePointsReturnType = {
  data: {
    totalPointsAmount: number
    dailyPointsAmount: number
    claimablePointsAmount: number
    nextDropTimestamp: number
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
    },
    formatted: {
      totalPointsAmount: formattedTotalPointsAmount,
      dailyPointsAmount: formattedDailyPointsAmount,
      claimablePointsAmount: formattedClaimablePointsAmount,
    },
  }
}
