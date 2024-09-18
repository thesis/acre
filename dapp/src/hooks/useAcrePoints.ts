import { useMutation, useQuery } from "@tanstack/react-query"
import { acreApi, bigIntToUserAmount } from "#/utils"
import { queryKeysFactory } from "#/constants"
import { MODAL_TYPES } from "#/types"
import { useWallet } from "./useWallet"
import { useModal } from "./useModal"

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
  const { ethAddress = "" } = useWallet()
  const { openModal } = useModal()

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
    mutationFn: async () => acreApi.claimPoints(ethAddress),
    onSettled: async () => {
      await userPointsDataQuery.refetch()
    },
    onSuccess: (data) => {
      const claimedAmount = bigIntToUserAmount(data.claimed, 0)
      const totalAmount = bigIntToUserAmount(data.total, 0)

      openModal(MODAL_TYPES.ACRE_POINTS_CLAIM, {
        claimedAmount,
        totalAmount,
      })
    },
    // TODO: Add the case when something goes wrong
    // onError: (error) => {},
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
