import { useMutation } from "@tanstack/react-query"
import { acreApi } from "#/utils"
import { MODAL_TYPES } from "#/types"
import { PostHogEvent } from "#/posthog/events"
import { useWallet } from "./useWallet"
import { useModal } from "./useModal"
import {
  useAcrePointsDataQuery,
  useUserPointsDataQuery,
} from "./tanstack-query"
import { usePostHogCapture } from "./posthog/usePostHogCapture"

type UseAcrePointsReturnType = {
  totalBalance: number
  claimableBalance: number
  nextDropTimestamp?: number
  isCalculationInProgress?: boolean
  claimPoints: () => void
  updateUserPointsData: () => Promise<unknown>
  updatePointsData: () => Promise<unknown>
  totalPoolBalance: number
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const { ethAddress = "" } = useWallet()
  const { openModal } = useModal()
  const { handleCapture, handleCaptureWithCause } = usePostHogCapture()

  const userPointsDataQuery = useUserPointsDataQuery()
  const pointsDataQuery = useAcrePointsDataQuery()

  const { mutate: claimPoints } = useMutation({
    mutationFn: async () => acreApi.claimPoints(ethAddress),
    onSettled: async () => {
      await userPointsDataQuery.refetch()
    },
    onSuccess: (data) => {
      const claimedAmount = Number(data.claimed)
      const totalAmount = Number(data.total)

      openModal(MODAL_TYPES.ACRE_POINTS_CLAIM, {
        claimedAmount,
        totalAmount,
      })

      handleCapture(PostHogEvent.PointsClaimSuccess, {
        claimedAmount,
        totalAmount,
      })
    },
    onError: (error) => {
      handleCaptureWithCause(error, PostHogEvent.PointsClaimFailure)
    },
  })

  return {
    totalBalance: userPointsDataQuery.data?.claimed || 0,
    claimableBalance: userPointsDataQuery.data?.unclaimed || 0,
    nextDropTimestamp: pointsDataQuery.data?.dropAt,
    isCalculationInProgress: pointsDataQuery.data?.isCalculationInProgress,
    claimPoints,
    updateUserPointsData: userPointsDataQuery.refetch,
    updatePointsData: pointsDataQuery.refetch,
    totalPoolBalance: pointsDataQuery.data?.totalPool || 0,
  }
}
