import { routerPath } from "#/router/path"
import { ACTION_FLOW_TYPES } from "#/types"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
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
  const { closeModal } = useModal()
  const location = useLocation()
  const isSignedMessage = useIsSignedMessage()

  useEffect(() => {
    const shouldOpenDepositModal =
      hasFetchedActivities && isSignedMessage && !hasActivities

    if (shouldOpenDepositModal) openDepositModal()
  }, [hasFetchedActivities, hasActivities, isSignedMessage, openDepositModal])

  useEffect(() => {
    const shouldCloseDepositModal =
      location.pathname !== routerPath.dashboard || !isSignedMessage

    if (shouldCloseDepositModal) closeModal()
  }, [location, isSignedMessage, closeModal])
}

export default useDepositCallToAction
