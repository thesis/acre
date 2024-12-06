import { ActionFlowType, MODAL_TYPES } from "#/types"
import { useCallback } from "react"
import { useModal } from "./useModal"

export function useTransactionModal(type: ActionFlowType) {
  const { openModal } = useModal()

  return useCallback(() => {
    openModal(MODAL_TYPES[type], {
      type,
      closeOnEsc: false,
    })
  }, [openModal, type])
}
