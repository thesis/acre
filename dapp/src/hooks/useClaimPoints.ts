import { useMutation } from "@tanstack/react-query"
import { acreApi } from "#/utils"
import { MODAL_TYPES } from "#/types"
import { PostHogEvent } from "#/posthog/events"
import { useWallet } from "./useWallet"
import { useModal } from "./useModal"
import { usePostHogCapture } from "./posthog/usePostHogCapture"
import useUserPointsData from "./useUserPointsData"

export default function useClaimPoints() {
  const { ethAddress = "" } = useWallet()
  const { openModal } = useModal()
  const { handleCapture, handleCaptureWithCause } = usePostHogCapture()
  const { refetch: userPointsDataRefetch } = useUserPointsData()

  return useMutation({
    mutationFn: async () => acreApi.claimPoints(ethAddress),
    onSettled: async () => {
      await userPointsDataRefetch()
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
}
