import React, { ReactNode } from "react"
import { ModalBody, ModalHeader, useTimeout } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { TextMd } from "#/components/shared/Typography"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"

export default function TriggerTransactionModal({
  callback,
  children,
  delay = ONE_SEC_IN_MILLISECONDS,
}: {
  callback: () => void
  children: ReactNode
  delay?: number
}) {
  useTimeout(callback, delay)

  return (
    <>
      <ModalHeader>Waiting transaction...</ModalHeader>
      <ModalBody>
        <Spinner size="xl" />
        <TextMd>Please complete the transaction in your wallet.</TextMd>
        {children}
      </ModalBody>
    </>
  )
}
