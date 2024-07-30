import { routerPath } from "#/router/path"
import { ACTION_FLOW_TYPES, MODAL_TYPES } from "#/types"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  const { openModal, closeModal } = useModal()
  const isSignedMessage = useIsSignedMessage()
  const navigate = useNavigate()

  useEffect(() => {
    const shouldOpenDepositModal =
      hasFetchedActivities && isSignedMessage && !hasActivities

    if (shouldOpenDepositModal)
      openModal(MODAL_TYPES.STAKE, {
        type: ACTION_FLOW_TYPES.STAKE,
        closeModal: () => {
          closeModal()
          navigate(routerPath.home)
        },
      })

    return () => {
      closeModal()
    }
  }, [
    hasFetchedActivities,
    hasActivities,
    isSignedMessage,
    openModal,
    closeModal,
    navigate,
  ])
}

export default useDepositCallToAction
