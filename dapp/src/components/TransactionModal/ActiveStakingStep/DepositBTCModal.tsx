import React, { useCallback } from "react"
import { useModalFlowContext, useDepositBTC } from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import { asyncWrapper } from "#/utils"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function DepositBTCModal() {
  const { endTransactionProcess } = useModalFlowContext()
  const { depositBTC } = useDepositBTC(endTransactionProcess)

  const handledDepositBTC = useCallback(() => {
    asyncWrapper(depositBTC())
  }, [depositBTC])

  return (
    <StakingStepsModalContent
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={handledDepositBTC}
    >
      <Alert>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakingStepsModalContent>
  )
}
