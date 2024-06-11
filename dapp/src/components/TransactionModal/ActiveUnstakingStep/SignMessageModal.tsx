import React, { useCallback } from "react"
import { useAppDispatch, useExecuteFunction, useModal } from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { Button } from "@chakra-ui/react"
import { logPromiseFailure } from "#/utils"
import { setStatus } from "#/store/action-flow"
import TriggerTransactionModal from "../TriggerTransactionModal"

export default function SignMessageModal() {
  const dispatch = useAppDispatch()
  const { closeModal } = useModal()
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
    <TriggerTransactionModal callback={handleSignMessageWrapper}>
      <Button size="lg" width="100%" variant="outline" onClick={closeModal}>
        Cancel
      </Button>
    </TriggerTransactionModal>
  )
}
