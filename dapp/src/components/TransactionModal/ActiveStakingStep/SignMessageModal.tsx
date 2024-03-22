import React, { useCallback, useEffect, useState } from "react"
import {
  useExecuteFunction,
  useModalFlowContext,
  useStakeFlowContext,
  useToast,
} from "#/hooks"
import { logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES, TOAST_TYPES } from "#/types"
import { ReceiveSTBTCAlert } from "#/components/shared/alerts"
import { TOASTS } from "#/components/shared/toasts"
import StakingStepsModalContent from "./StakingStepsModalContent"

const TOAST_ID = TOAST_TYPES.SIGNING_ERROR

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useStakeFlowContext()
  const [buttonText, setButtonText] = useState("Sign now")
  const { close: closeToast, open: openToast } = useToast()

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  const onSignMessageSuccess = useCallback(() => {
    closeToast(TOAST_ID)
    goNext()
  }, [closeToast, goNext])

  const onSignMessageError = useCallback(() => {
    openToast(TOASTS[TOAST_ID]())
    setButtonText("Try again")
  }, [openToast])

  const handleSignMessage = useExecuteFunction(
    signMessage,
    onSignMessageSuccess,
    onSignMessageError,
  )

  const handleSignMessageWrapper = useCallback(() => {
    logPromiseFailure(handleSignMessage())
  }, [handleSignMessage])

  return (
    <StakingStepsModalContent
      buttonText={buttonText}
      activeStep={0}
      onClick={handleSignMessageWrapper}
    >
      <ReceiveSTBTCAlert />
    </StakingStepsModalContent>
  )
}
