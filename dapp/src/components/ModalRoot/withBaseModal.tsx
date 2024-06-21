import React, { ComponentType } from "react"
import {
  Modal,
  ModalContent,
  ModalContentProps,
  ModalOverlay,
  ModalOverlayProps,
  ModalProps,
} from "@chakra-ui/react"
import { BaseModalProps } from "#/types"

export const MODAL_BASE_SIZE = "lg"

function withBaseModal<T extends BaseModalProps>(
  WrappedModalContent: ComponentType<T>,
  modalProps?: Omit<ModalProps, "isOpen" | "onClose" | "children">,
  options?: {
    modalOverlayProps?: Omit<ModalOverlayProps, "children">
    modalContentProps?: Omit<ModalContentProps, "children">
  },
) {
  const { modalOverlayProps, modalContentProps } = options ?? {}

  return function ModalBase(props: T) {
    const { closeModal } = props
    return (
      <Modal
        isOpen
        onClose={closeModal}
        scrollBehavior="inside"
        closeOnOverlayClick={false}
        size={MODAL_BASE_SIZE}
        {...modalProps}
      >
        <ModalOverlay mt="header_height" {...modalOverlayProps} />
        <ModalContent mt="modal_shift" {...modalContentProps}>
          <WrappedModalContent {...props} />
        </ModalContent>
      </Modal>
    )
  }
}

export default withBaseModal
