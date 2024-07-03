import { ModalType, ModalProps } from "#/types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type ModalState = {
  modalType: ModalType | null
  props?: ModalProps
}

const initialState: ModalState = {
  modalType: null,
  props: {},
}

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (
      state: ModalState,
      action: PayloadAction<{ modalType: ModalType; props?: ModalProps }>,
    ) => {
      state.modalType = action.payload.modalType
      state.props = action.payload.props
    },
    closeModal: () => initialState,
  },
})

export const { openModal, closeModal } = modalSlice.actions
