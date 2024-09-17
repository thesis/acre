import { useMutation, useQuery } from "@tanstack/react-query"
import { acrePoints as acrePointsUtils, bigIntToUserAmount } from "#/utils"
import { queryKeysFactory } from "#/constants"
import { useWallet } from "./useWallet"

const { userKeys, acreKeys } = queryKeysFactory

type UseAcrePointsReturnType = {
  totalBalance: number
  claimableBalance: number
  nextDropTimestamp?: number
  handleClaim: () => void
  updateBalance: () => Promise<unknown>
  updatePointsData: () => Promise<unknown>
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const { address = "" } = useWallet()

  const pointsQuery = useQuery({
    queryKey: [...userKeys.claimedAcrePoints(), address],
    enabled: !!address,
    queryFn: async () => acrePointsUtils.getAcrePoints(address),
  })

  const pointsDataQuery = useQuery({
    queryKey: [...acreKeys.pointsData()],
    queryFn: async () => acrePointsUtils.getPointsData(),
  })

  const { mutate: handleClaim } = useMutation({
    mutationFn: async () => acrePointsUtils.handleClaimAcrePoints(address),
    onSettled: async () => {
      await pointsQuery.refetch()
    },
  })

  const totalBalance = bigIntToUserAmount(
    BigInt(pointsQuery.data?.claimed ?? 0),
    0,
  )
  const claimableBalance = bigIntToUserAmount(
    BigInt(pointsQuery.data?.unclaimed ?? 0),
    0,
  )

  return {
    totalBalance,
    claimableBalance,
    nextDropTimestamp: pointsDataQuery.data?.dropAt,
    handleClaim,
    updateBalance: pointsQuery.refetch,
    updatePointsData: pointsDataQuery.refetch,
  }
}
