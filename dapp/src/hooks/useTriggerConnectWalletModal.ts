import { useEffect, useRef } from "react"
import { MODAL_TYPES } from "#/types"
import { useIsSignedMessage } from "./store/useIsSignedMessage"
import { useModal } from "./useModal"
import useIsEmbed from "./useIsEmbed"

export default function useTriggerConnectWalletModal() {
  const isSignedMessage = useIsSignedMessage()
  const { isEmbed } = useIsEmbed()
  const { openModal, closeModal } = useModal()
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current && isEmbed && !isSignedMessage) {
      isMounted.current = true
      openModal(MODAL_TYPES.CONNECT_WALLET, {
        withCloseButton: false,
        closeOnEsc: false,
      })
    }
  }, [closeModal, isEmbed, isSignedMessage, openModal])
}