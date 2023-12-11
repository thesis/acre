import React from "react"
import { Modal, ModalCloseButton, ModalContent } from "@chakra-ui/react"
import { HEADER_HEIGHT } from "../Header"
import { useModal, useSidebar } from "../../hooks"

export default function BaseModal({ children }: { children: React.ReactNode }) {
  const { closeModal } = useModal()
  const { onClose: closeSidebar } = useSidebar()

  return (
    <Modal
      isOpen
      size="md"
      onClose={() => {
        closeSidebar()
        closeModal()
      }}
    >
      <ModalContent mt={2 * HEADER_HEIGHT}>
        <ModalCloseButton />
        {children}
      </ModalContent>
    </Modal>
  )
}
