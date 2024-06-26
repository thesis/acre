import { useEffect } from "react"
import { MODAL_TYPES } from "#/types"
import { useIsSignedMessage } from "./store/useIsSignedMessage"
import { useWallet } from "./useWallet"
import { useModal } from "./useModal"

export function useDisconnectWallet() {
  const isSignedMessage = useIsSignedMessage()
  const { isConnected, onDisconnect } = useWallet()
  const { modalType } = useModal()

  useEffect(() => {
    if (
      !isSignedMessage &&
      isConnected &&
      modalType !== MODAL_TYPES.CONNECT_WALLET
    ) {
      onDisconnect()
    }
  }, [isConnected, isSignedMessage, modalType, onDisconnect])
}
