import { useMutation, useQuery } from "@tanstack/react-query"
import { acreApi, bigIntToUserAmount } from "#/utils"
import { queryKeysFactory } from "#/constants"
import { useWallet } from "./useWallet"

const { userKeys, acreKeys } = queryKeysFactory

type UseAcrePointsReturnType = {
  totalBalance: number
  claimableBalance: number
  nextDropTimestamp?: number
  claimPoints: () => void
  updateUserPointsData: () => Promise<unknown>
  updatePointsData: () => Promise<unknown>
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const { address = "", ethAddress = "" } = useWallet()

  const userPointsDataQuery = useQuery({
    queryKey: [...userKeys.pointsData(), ethAddress],
    enabled: !!ethAddress,
    queryFn: async () => acreApi.getPointsDataByUser(ethAddress),
  })

  const pointsDataQuery = useQuery({
    queryKey: [...acreKeys.pointsData()],
    queryFn: async () => acreApi.getPointsData(),
  })

  const { mutate: claimPoints } = useMutation({
    mutationFn: async () => acreApi.claimPoints(address),
    onSettled: async () => {
      await userPointsDataQuery.refetch()
    },
  })

  const { data } = userPointsDataQuery
  const totalBalance = bigIntToUserAmount(data?.claimed ?? 0n, 0)
  const claimableBalance = bigIntToUserAmount(data?.unclaimed ?? 0n, 0)

  return {
    totalBalance,
    claimableBalance,
    nextDropTimestamp: pointsDataQuery.data?.dropAt,
    claimPoints,
    updateUserPointsData: userPointsDataQuery.refetch,
    updatePointsData: pointsDataQuery.refetch,
  }
}
