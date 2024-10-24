import React, { useCallback } from "react"
import { Link, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { EXTERNAL_HREF } from "#/constants"
import { BaseModalProps } from "#/types"
import { useAccessCode } from "#/hooks"
import withBaseModal from "./ModalRoot/withBaseModal"
import PasswordForm from "./shared/PasswordForm"
import { PasswordFormValues } from "./shared/PasswordForm/PasswordFormBase"

export function GateModalBase({ closeModal }: BaseModalProps) {
  const { saveAccessCode } = useAccessCode()

  const onSubmitForm = useCallback(
    (values: PasswordFormValues) => {
      const { password } = values
      if (!password) return

      closeModal()
      saveAccessCode(password)
    },
    [closeModal, saveAccessCode],
  )

  return (
    <>
      <ModalHeader>Enter password</ModalHeader>
      <ModalBody>
        <PasswordForm submitButtonText="Connect" onSubmitForm={onSubmitForm} />
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

const GateModal = withBaseModal(GateModalBase, { closeOnEsc: false })
export default GateModal
