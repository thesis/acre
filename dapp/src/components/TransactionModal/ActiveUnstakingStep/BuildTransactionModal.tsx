import React from "react"
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
} from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { TextMd } from "#/components/shared/Typography"

export default function BuildTransactionModal({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <>
      <ModalCloseButton onClick={onClose} />
      <ModalHeader>Preparing withdrawal transaction...</ModalHeader>
      <ModalBody>
        <Spinner size="xl" variant="filled" />
        <TextMd>This may take a few minutes.</TextMd>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ModalBody>
    </>
  )
}
