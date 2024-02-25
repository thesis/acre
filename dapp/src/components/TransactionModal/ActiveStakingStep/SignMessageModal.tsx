import React, { useCallback, useEffect } from "react"
import {
  useExecuteFunction,
  useModalFlowContext,
  useStakeFlowContext,
} from "#/hooks"
import { logPromiseFailure } from "#/utils"
import AlertReceiveSTBTC from "#/components/shared/AlertReceiveSTBTC"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useStakeFlowContext()
  const handleSignMessage = useExecuteFunction(signMessage, goNext)

  const handleSignMessageWrapper = useCallback(() => {
    logPromiseFailure(handleSignMessage())
  }, [handleSignMessage])

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  return (
    <StakingStepsModalContent
      buttonText="Sign now"
      activeStep={0}
      onClick={handleSignMessageWrapper}
    >
      <AlertReceiveSTBTC />
    </StakingStepsModalContent>
  )
}
