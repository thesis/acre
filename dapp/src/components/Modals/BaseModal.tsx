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
      <ModalContent p={4} gap={4} mt={2 * HEADER_HEIGHT}>
        <ModalCloseButton
          top={-8}
          right={-8}
          border="1px"
          borderColor="white"
          rounded="100%"
        />
        {children}
      </ModalContent>
    </Modal>
  )
}
