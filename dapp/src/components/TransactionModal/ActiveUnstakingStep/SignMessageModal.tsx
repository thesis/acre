import React, { useCallback, useEffect } from "react"
import { useExecuteFunction, useModalFlowContext } from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { Button, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { logPromiseFailure } from "#/utils"
import { ReceiveSTBTCAlert } from "#/components/shared/alerts"

export default function SignMessageModal() {
  const { setStatus } = useModalFlowContext()

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  const onSignMessageSuccess = useCallback(() => {
    setStatus(PROCESS_STATUSES.SUCCEEDED)
  }, [setStatus])

  // TODO: After a failed attempt, we should display the message
  const onSignMessageError = useCallback(() => {
    setStatus(PROCESS_STATUSES.FAILED)
  }, [setStatus])

  const handleSignMessage = useExecuteFunction(
    // TODO: Use a correct function from the SDK
    async () => {},
    onSignMessageSuccess,
    onSignMessageError,
  )

  const handleSignMessageWrapper = useCallback(() => {
    setStatus(PROCESS_STATUSES.LOADING)

    // TODO: Remove when SDK is ready
    setTimeout(() => {
      logPromiseFailure(handleSignMessage())
    }, 5000)
  }, [setStatus, handleSignMessage])

  return (
    <>
      <ModalHeader>Sign message</ModalHeader>
      <ModalBody textAlign="start" alignItems="start" py={0} gap={10}>
        <TextMd color="grey.500">
          You will sign a gas-free Ethereum message to indicate the address
          where you&apos;d like to get your stBTC liquid staking token.
        </TextMd>
        <ReceiveSTBTCAlert />
      </ModalBody>
      <ModalFooter pt={10}>
        <Button size="lg" width="100%" onClick={handleSignMessageWrapper}>
          Continue
        </Button>
      </ModalFooter>
    </>
  )
}
