import React from "react"
import { Link, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { EXTERNAL_HREF } from "#/constants"
import { BaseModalProps } from "#/types"
import withBaseModal from "./ModalRoot/withBaseModal"
import PasswordForm from "./shared/PasswordForm"

export function GateModalBase({ closeModal }: BaseModalProps) {
  return (
    <>
      <ModalHeader>Enter password</ModalHeader>
      <ModalBody>
        <PasswordForm submitButtonText="Connect" onSubmitForm={closeModal} />
      </ModalBody>
      <ModalFooter pt={0}>
        <TextSm>
          Don’t have a password? Contact us on{" "}
          <Link
            fontWeight="bold"
            textDecoration="underline"
            href={EXTERNAL_HREF.DISCORD}
            isExternal
          >
            Discord
          </Link>
        </TextSm>
      </ModalFooter>
    </>
  )
}

const GateModal = withBaseModal(GateModalBase)
export default GateModal
