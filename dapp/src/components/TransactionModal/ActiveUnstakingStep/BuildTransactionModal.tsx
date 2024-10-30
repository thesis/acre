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
      <ModalHeader>Building transaction data...</ModalHeader>
      <ModalBody>
        <Spinner size="xl" variant="filled" />
        <TextMd>We are building your withdrawal data.</TextMd>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ModalBody>
    </>
  )
}
