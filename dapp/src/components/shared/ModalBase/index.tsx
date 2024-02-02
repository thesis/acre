import React from "react"
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react"

export default function ModalBase({ children, ...restProps }: ModalProps) {
  return (
    <Modal size="lg" {...restProps}>
      <ModalOverlay mt="header_height" />
      <ModalContent mt="modal_shift">
        <ModalCloseButton />
        {children}
      </ModalContent>
    </Modal>
  )
}
