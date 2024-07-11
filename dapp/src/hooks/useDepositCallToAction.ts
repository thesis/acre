import { routerPath } from "#/router/path"
import { ACTION_FLOW_TYPES } from "#/types"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useIsSignedMessage } from "./store"
import { useTransactionModal } from "./useTransactionModal"
import { useModal } from "./useModal"
import useBitcoinPosition from "./sdk/useBitcoinPosition"

export function useDepositCallToAction() {
  const { data } = useBitcoinPosition()
  const bitcoinWalletBalance = data?.estimatedBitcoinBalance ?? 0n
  const openDepositModal = useTransactionModal(ACTION_FLOW_TYPES.STAKE)
  const { closeModal } = useModal()
  const location = useLocation()
  const isSignedMessage = useIsSignedMessage()

  useEffect(() => {
    const shouldOpenDepositModal =
      isSignedMessage && bitcoinWalletBalance === 0n

    if (shouldOpenDepositModal) openDepositModal()
    // This side effect should be triggered only when page component gets
    // mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const shouldCloseDepositModal =
      location.pathname !== routerPath.dashboard || !isSignedMessage

    if (shouldCloseDepositModal) closeModal()
  }, [location, isSignedMessage, closeModal])
}
