import { ActionFlowType, MODAL_TYPES } from "#/types"
import { useCallback } from "react"
import { useModal } from "./useModal"
import { useWallet } from "./useWallet"

export function useTransactionModal(type: ActionFlowType) {
  const { isConnected } = useWallet()
  const { openModal } = useModal()

  const handleTransactionModal = useCallback(() => {
    openModal(MODAL_TYPES[type], { type })
  }, [openModal, type])

  const handleConnectWalletModal = useCallback(() => {
    openModal(MODAL_TYPES.CONNECT_WALLET)
  }, [openModal])

  return useCallback(() => {
    if (isConnected) {
      handleTransactionModal()
    } else {
      handleConnectWalletModal()
    }
  }, [handleConnectWalletModal, handleTransactionModal, isConnected])
}
