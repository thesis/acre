import React, { useCallback, useEffect } from "react"
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

  const { closeToast, showToast } = useToast({
    id: "sign-message-error-toast",
    render: ({ onClose }) => (
      <Toast status="error" title={ERRORS.SIGNING} onClose={onClose}>
        <TextSm>Please try again.</TextSm>
      </Toast>
    ),
  })

  const handleSignMessage = useExecuteFunction(signMessage, goNext, showToast)

  const handleSignMessageWrapper = useCallback(() => {
    logPromiseFailure(handleSignMessage())
  }, [handleSignMessage])

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  useEffect(() => () => closeToast(), [closeToast])

  return (
    <StakingStepsModalContent
      buttonText="Sign now"
      activeStep={0}
      onClick={handleSignMessageWrapper}
    >
      <ReceiveSTBTCAlert />
    </StakingStepsModalContent>
  )
}
