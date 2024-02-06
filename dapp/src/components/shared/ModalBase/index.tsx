import React from "react"
import { Modal, ModalContent, ModalOverlay, ModalProps } from "@chakra-ui/react"

export default function ModalBase({ children, ...restProps }: ModalProps) {
  return (
    <Modal size="lg" {...restProps}>
      <ModalOverlay mt="header_height" />
      <ModalContent mt="modal_shift">{children}</ModalContent>
    </Modal>
  )
}
