import React, { ComponentType } from "react"
import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react"
import { BaseModalProps } from "#/types"

export const MODAL_BASE_SIZE = "lg"

function withBaseModal<T extends BaseModalProps>(
  WrappedModalContent: ComponentType<T>,
) {
  return function ModalBase(props: T) {
    const { closeModal } = props
    return (
      <Modal
        isOpen
        onClose={closeModal}
        scrollBehavior="inside"
        size={MODAL_BASE_SIZE}
      >
        <ModalOverlay mt="header_height" />
        <ModalContent mt="modal_shift">
          <WrappedModalContent {...props} />
        </ModalContent>
      </Modal>
    )
  }
}

export default withBaseModal
