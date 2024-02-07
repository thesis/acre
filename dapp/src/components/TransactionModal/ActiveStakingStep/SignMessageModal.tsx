import React, { useEffect } from "react"
import { useModalFlowContext, useSignMessage } from "#/hooks"
import { asyncWrapper } from "#/utils"
import AlertReceiveSTBTC from "#/components/shared/AlertReceiveSTBTC"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function SignMessageModal() {
  const { goNext, setStatus } = useModalFlowContext()
  const { signMessage } = useSignMessage(goNext)

  useEffect(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [setStatus])

  const handleClick = () => {
    asyncWrapper(signMessage())
  }

  return (
    <StakingStepsModalContent
      buttonText="Continue"
      activeStep={0}
      onClick={handleClick}
    >
      <AlertReceiveSTBTC />
    </StakingStepsModalContent>
  )
}
