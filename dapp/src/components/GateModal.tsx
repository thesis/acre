import React from "react"
import { ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import withBaseModal from "./ModalRoot/withBaseModal"
import PasswordForm from "./shared/PasswordForm"

export function GateModalBase() {
  return (
    <>
      <ModalHeader>Enter password</ModalHeader>
      <ModalBody>
        <PasswordForm submitButtonText="Connect" onSubmitForm={() => {}} />
      </ModalBody>
      <ModalFooter>
        <TextSm>Don’t have a password? Contact us on Discord</TextSm>
      </ModalFooter>
    </>
  )
}

const GateModal = withBaseModal(GateModalBase)
export default GateModal
