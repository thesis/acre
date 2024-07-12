import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { MODAL_TYPES } from "#/types"
import { Pathname } from "#/router/path"
import { useIsSignedMessage } from "./store/useIsSignedMessage"
import { useModal } from "./useModal"

export default function useTriggerConnectWalletModal(pathname: Pathname) {
  const isSignedMessage = useIsSignedMessage()
  const location = useLocation()
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    const isOnPage = pathname === location.pathname

    if (isOnPage && !isSignedMessage)
      openModal(MODAL_TYPES.CONNECT_WALLET, { withCloseButton: false })

    return () => {
      closeModal()
    }
  }, [closeModal, isSignedMessage, location.pathname, openModal, pathname])
}
