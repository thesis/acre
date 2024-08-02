import { ACTION_FLOW_TYPES, MODAL_TYPES } from "#/types"
import { useEffect } from "react"
import {
  useAllActivitiesCount,
  useHasFetchedActivities,
  useIsSignedMessage,
} from "./store"
import { useTransactionModal } from "./useTransactionModal"
import { useModal } from "./useModal"

function useDepositCallToAction() {
  const activitiesCount = useAllActivitiesCount()
  const hasFetchedActivities = useHasFetchedActivities()
  const hasActivities = activitiesCount > 0
  const openDepositModal = useTransactionModal(ACTION_FLOW_TYPES.STAKE)
  const { modalType, closeModal } = useModal()
  const isSignedMessage = useIsSignedMessage()

  useEffect(() => {
    const shouldOpenDepositModal =
      hasFetchedActivities && isSignedMessage && !hasActivities

    if (shouldOpenDepositModal) openDepositModal()

    return () => {
      if (modalType === MODAL_TYPES.STAKE) {
        closeModal()
      }
    }
  }, [
    hasFetchedActivities,
    hasActivities,
    isSignedMessage,
    openDepositModal,
    closeModal,
    modalType,
  ])
}

export default useDepositCallToAction
