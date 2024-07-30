import React, { ComponentType } from "react"
import { Modal, ModalContent, ModalOverlay, ModalProps } from "@chakra-ui/react"
import { BaseModalProps } from "#/types"
import { useSidebar } from "#/hooks"

const MODAL_BASE_SIZE = "lg"

function withBaseModal<T extends BaseModalProps>(
  WrappedModalContent: ComponentType<T>,
  modalProps?: Omit<ModalProps, "isOpen" | "onClose" | "children">,
) {
  return function ModalBase(props: T) {
    const { closeModal, closeOnEsc } = props

    const { isOpen: isSidebarOpen } = useSidebar()

    return (
      <Modal
        isOpen
        onClose={closeModal}
        scrollBehavior="inside"
        closeOnOverlayClick={false}
        size={MODAL_BASE_SIZE}
        closeOnEsc={closeOnEsc}
        {...modalProps}
      >
        <ModalOverlay mt="header_height" />
        <ModalContent
          mr={{
            base: isSidebarOpen ? "var(--chakra-sizes-sidebar_width)" : 0,
            xl: 0,
          }}
        >
          <WrappedModalContent {...props} closeModal={closeModal} />
        </ModalContent>
      </Modal>
    )
  }
}

export default withBaseModal
