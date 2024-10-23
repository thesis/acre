import React, { useCallback, useEffect } from "react"
import { Link, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { EXTERNAL_HREF } from "#/constants"
import { BaseModalProps } from "#/types"
import { useAccessCode } from "#/hooks"
import { acreApi } from "#/utils"
import { useQuery } from "@tanstack/react-query"
import withBaseModal from "./ModalRoot/withBaseModal"
import PasswordForm from "./shared/PasswordForm"
import { PasswordFormValues } from "./shared/PasswordForm/PasswordFormBase"
import LoadingModal from "./TransactionModal/LoadingModal"

export function GateModalBase({ closeModal }: BaseModalProps) {
  const { encodedCode, saveAccessCode } = useAccessCode()
  const { data, isLoading } = useQuery({
    queryKey: ["verify-access-code"],
    enabled: !!encodedCode,
    queryFn: async () => acreApi.verifyAccessCode(encodedCode!),
  })

  const onSubmitForm = useCallback(
    (values: PasswordFormValues) => {
      const { password } = values
      if (!password) return

      closeModal()
      saveAccessCode(password)
    },
    [closeModal, saveAccessCode],
  )

  useEffect(() => {
    if (data?.isValid) closeModal()
  }, [closeModal, data?.isValid])

  if (isLoading) return <LoadingModal />

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

const GateModal = withBaseModal(GateModalBase)
export default GateModal
