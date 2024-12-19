import {
  closeModal,
  openModal,
  selectIsOpenGlobalErrorModal,
  selectModalProps,
  selectModalType,
} from "#/store/modal"
import { ModalProps, ModalType } from "#/types"
import { useCallback } from "react"
import useAppDispatch from "./store/useAppDispatch"
import useAppSelector from "./store/useAppSelector"

export default function useModal() {
  const modalType = useAppSelector(selectModalType)
  const modalProps = useAppSelector(selectModalProps)
  const isOpenGlobalErrorModal = useAppSelector(selectIsOpenGlobalErrorModal)
  const dispatch = useAppDispatch()

  const handleOpenModal = useCallback(
    (type: ModalType, props?: ModalProps) => {
      // We should not allow to open other modal windows when the global error modal is displayed.
      if (isOpenGlobalErrorModal) return

      dispatch(openModal({ modalType: type, props }))
    },
    [dispatch, isOpenGlobalErrorModal],
  )

  const handleCloseModal = useCallback(() => dispatch(closeModal()), [dispatch])

  return {
    modalType,
    modalProps,
    isOpenGlobalErrorModal,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
  }
}
