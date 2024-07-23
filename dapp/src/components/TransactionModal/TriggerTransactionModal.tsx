import React, { ReactNode } from "react"
import { ModalBody, ModalHeader, useTimeout } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { TextMd } from "#/components/shared/Typography"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"

export default function TriggerTransactionModal({
  callback,
  children,
  delay = ONE_SEC_IN_MILLISECONDS,
  title = "Awaiting transaction...",
  subtitle = "Please complete the transaction in your wallet.",
}: {
  callback: () => void
  children: ReactNode
  delay?: number
  title?: string
  subtitle?: string
}) {
  useTimeout(callback, delay)

  return (
    <>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <Spinner size="xl" variant="filled" />
        <TextMd>{subtitle}</TextMd>
        {children}
      </ModalBody>
    </>
  )
}
