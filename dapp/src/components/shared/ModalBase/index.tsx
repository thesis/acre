import React from "react"
import { Modal, ModalContent, ModalOverlay, ModalProps } from "@chakra-ui/react"

export const MODAL_BASE_SIZE = "lg"

export default function ModalBase({ children, ...restProps }: ModalProps) {
  return (
    <Modal size={MODAL_BASE_SIZE} {...restProps}>
      <ModalOverlay mt="header_height" />
      <ModalContent mt="modal_shift">{children}</ModalContent>
    </Modal>
  )
}
