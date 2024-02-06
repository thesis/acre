import React, { useEffect } from "react"
import { useModalFlowContext, useSignMessage } from "#/hooks"
import { asyncWrapper } from "#/utils"
import AlertReceiveSTBTC from "#/components/shared/AlertReceiveSTBTC"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function SignMessageModal() {
  const { goNext, startTransactionProcess } = useModalFlowContext()
  const { signMessage } = useSignMessage(goNext)

  useEffect(() => {
    startTransactionProcess()
  }, [startTransactionProcess])

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
