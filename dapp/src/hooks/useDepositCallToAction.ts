import { routerPath } from "#/router/path"
import { ACTION_FLOW_TYPES, MODAL_TYPES } from "#/types"
import { useEffect } from "react"
import {
  useAllActivitiesCount,
  useHasFetchedActivities,
  useIsSignedMessage,
} from "./store"
import { useModal } from "./useModal"

function useDepositCallToAction() {
  const activitiesCount = useAllActivitiesCount()
  const hasFetchedActivities = useHasFetchedActivities()
  const hasActivities = activitiesCount > 0
  const { modalType, openModal, closeModal } = useModal()
  const isSignedMessage = useIsSignedMessage()

  useEffect(() => {
    const shouldOpenDepositModal =
      hasFetchedActivities && isSignedMessage && !hasActivities

    if (shouldOpenDepositModal)
      openModal(MODAL_TYPES.STAKE, {
        type: ACTION_FLOW_TYPES.STAKE,
        navigateToOnClose: routerPath.home,
      })

    return () => {
      if (modalType === MODAL_TYPES.STAKE) {
        closeModal()
      }
    }
  }, [
    hasFetchedActivities,
    hasActivities,
    isSignedMessage,
    openModal,
    closeModal,
    modalType,
  ])
}

export default useDepositCallToAction
