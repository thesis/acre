import { MODAL_TYPES, ModalProps, ModalType } from "#/types"
import { RootState } from ".."

export const selectModalType = (state: RootState): ModalType | null =>
  state.modal.modalType

export const selectModalProps = (state: RootState): ModalProps | undefined =>
  state.modal.props

export const selectIsOpenGlobalErrorModal = (state: RootState): boolean =>
  state.modal.modalType === MODAL_TYPES.UNEXPECTED_ERROR
