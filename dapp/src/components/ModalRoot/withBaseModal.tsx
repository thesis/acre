import React, { ComponentType } from "react"
import { Modal, ModalContent, ModalOverlay, ModalProps } from "@chakra-ui/react"
import { BaseModalProps } from "#/types"

export const MODAL_BASE_SIZE = "lg"

function withBaseModal<T extends BaseModalProps>(
  WrappedModalContent: ComponentType<T>,
  modalProps?: Omit<ModalProps, "isOpen" | "onClose" | "children">,
) {
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
        <ModalOverlay mt="header_height" />
        <ModalContent>
          <WrappedModalContent {...props} />
        </ModalContent>
      </Modal>
    )
  }
}

export default withBaseModal
