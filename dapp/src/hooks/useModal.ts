import {
  closeModal,
  openModal,
  selectModalProps,
  selectModalType,
} from "#/store/modal"
import { ModalProps, ModalType } from "#/types"
import { useCallback } from "react"
import { useAppDispatch } from "./store/useAppDispatch"
import { useAppSelector } from "./store/useAppSelector"

export function useModal() {
  const modalType = useAppSelector(selectModalType)
  const modalProps = useAppSelector(selectModalProps)
  const dispatch = useAppDispatch()

  const handleOpenModal = useCallback(
    (type: ModalType, props?: ModalProps) => {
      dispatch(openModal({ modalType: type, props }))
    },
    [dispatch],
  )

  const handleCloseModal = useCallback(() => dispatch(closeModal()), [dispatch])

  return {
    modalType,
    modalProps,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
  }
}
