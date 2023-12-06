import React from "react"
import { Modal, ModalCloseButton, ModalContent } from "@chakra-ui/react"
import { useStakingFlowContext } from "../../hooks"
import { HEADER_HEIGHT } from "../Header"

export default function BaseModal({ children }: { children: React.ReactNode }) {
  const { closeModal } = useStakingFlowContext()

  return (
    <Modal isOpen onClose={closeModal} size="md">
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
