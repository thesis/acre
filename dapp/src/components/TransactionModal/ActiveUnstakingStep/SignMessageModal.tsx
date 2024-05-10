import React, { useCallback } from "react"
import { useAppDispatch, useExecuteFunction } from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { Button, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { logPromiseFailure } from "#/utils"
import { setStatus } from "#/store/action-flow"

export default function SignMessageModal() {
  const dispatch = useAppDispatch()

  const onSignMessageSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch])

  // TODO: After a failed attempt, we should display the message
  const onSignMessageError = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.FAILED))
  }, [dispatch])

  const handleSignMessage = useExecuteFunction(
    // TODO: Use a correct function from the SDK
    async () => {},
    onSignMessageSuccess,
    onSignMessageError,
  )

  const handleSignMessageWrapper = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.LOADING))

    // TODO: Remove when SDK is ready
    setTimeout(() => {
      logPromiseFailure(handleSignMessage())
    }, 5000)
  }, [dispatch, handleSignMessage])

  return (
    <>
      <ModalHeader>Sign message</ModalHeader>
      <ModalBody textAlign="start" alignItems="start" py={0} gap={10}>
        <TextMd color="grey.500">
          You will sign a gas-free Ethereum message to indicate the address
          where you&apos;d like to get your stBTC liquid staking token.
        </TextMd>
      </ModalBody>
      <ModalFooter pt={10}>
        <Button size="lg" width="100%" onClick={handleSignMessageWrapper}>
          Continue
        </Button>
      </ModalFooter>
    </>
  )
}
