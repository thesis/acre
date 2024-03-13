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

const ID_TOAST = "sign-message-error-toast"

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useStakeFlowContext()

  const toast = useToast({
    render: ({ onClose }) => (
      <Toast status="error" title={ERRORS.SIGNING} onClose={onClose}>
        <TextSm>Please try again.</TextSm>
      </Toast>
    ),
  })

  const onError = useCallback(() => {
    if (!toast.isActive(ID_TOAST)) {
      toast({
        id: ID_TOAST,
      })
    }
  }, [toast])

  const handleSignMessage = useExecuteFunction(signMessage, goNext, onError)

  const handleSignMessageWrapper = useCallback(() => {
    logPromiseFailure(handleSignMessage())
  }, [handleSignMessage])

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  useEffect(() => () => toast.close(ID_TOAST), [toast])

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
