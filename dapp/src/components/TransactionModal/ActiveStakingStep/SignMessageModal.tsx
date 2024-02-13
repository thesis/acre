import React, { useCallback, useEffect } from "react"
import { useModalFlowContext, useStakeFlowContext } from "#/hooks"
import { asyncWrapper } from "#/utils"
import AlertReceiveSTBTC from "#/components/shared/AlertReceiveSTBTC"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useStakeFlowContext()

  const handleSignMessage = useCallback(() => {
    asyncWrapper(signMessage(goNext))
  }, [goNext, signMessage])

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
