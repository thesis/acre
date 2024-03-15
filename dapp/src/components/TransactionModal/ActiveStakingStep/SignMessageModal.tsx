/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useState } from "react"
import {
  useExecuteFunction,
  useModalFlowContext,
  useStakeFlowContext,
  useToast,
} from "#/hooks"
import { ERRORS, logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { TextSm } from "#/components/shared/Typography"
import { ReceiveSTBTCAlert, Toast } from "#/components/shared/alerts"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useStakeFlowContext()
  const [buttonText, setButtonText] = useState("Sign now")

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  const { closeToast, showToast } = useToast({
    id: "sign-message-error-toast",
    render: ({ onClose }) => (
      <Toast status="error" title={ERRORS.SIGNING} onClose={onClose}>
        <TextSm>Please try again.</TextSm>
      </Toast>
    ),
  })

  const onSignMessageSuccess = useCallback(() => {
    closeToast()
    goNext()
  }, [closeToast, goNext])

  const onSignMessageError = useCallback(() => {
    showToast()
    setButtonText("Try again")
  }, [showToast])

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
