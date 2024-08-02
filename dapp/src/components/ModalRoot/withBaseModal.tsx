import React, { ComponentType, useCallback } from "react"
import { Modal, ModalContent, ModalOverlay, ModalProps } from "@chakra-ui/react"
import { BaseModalProps } from "#/types"
import { useSidebar } from "#/hooks"
import { useNavigate } from "react-router-dom"

const MODAL_BASE_SIZE = "lg"

function withBaseModal<T extends BaseModalProps>(
  WrappedModalContent: ComponentType<T>,
  modalProps?: Omit<ModalProps, "isOpen" | "onClose" | "children">,
) {
  return function ModalBase(props: T) {
    const { closeModal, closeOnEsc, navigateToOnClose } = props

    const { isOpen: isSidebarOpen } = useSidebar()
    const navigate = useNavigate()

    const handleCloseModal = useCallback(() => {
      closeModal()

      if (navigateToOnClose) {
        navigate(navigateToOnClose)
      }
    }, [closeModal, navigate, navigateToOnClose])

    return (
      <Modal
        isOpen
        onClose={handleCloseModal}
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
          <WrappedModalContent {...props} closeModal={handleCloseModal} />
        </ModalContent>
      </Modal>
    )
  }
}

export default withBaseModal
