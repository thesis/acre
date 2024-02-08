import React, { useCallback, useEffect } from "react"
import { useModalFlowContext, useSignMessage } from "#/hooks"
import { asyncWrapper } from "#/utils"
import AlertReceiveSTBTC from "#/components/shared/AlertReceiveSTBTC"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useSignMessage(goNext)

  const handleSignMessage = useCallback(() => {
    asyncWrapper(signMessage())
  }, [signMessage])

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  return (
    <StakingStepsModalContent
      buttonText="Continue"
      activeStep={0}
      onClick={handleSignMessage}
    >
      <AlertReceiveSTBTC />
    </StakingStepsModalContent>
  )
}
