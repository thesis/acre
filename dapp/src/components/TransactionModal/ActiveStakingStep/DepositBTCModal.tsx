import React, { useCallback } from "react"
import { useDepositBTCTransaction, useModalFlowContext } from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function DepositBTCModal() {
  const { endTransactionProcess } = useModalFlowContext()

  const onDepositSuccess = useCallback(() => {
    endTransactionProcess()
  }, [endTransactionProcess])

  const { depositBTC } = useDepositBTCTransaction(onDepositSuccess)

  return (
    <StakingStepsModalContent
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={depositBTC}
    >
      <Alert>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakingStepsModalContent>
  )
}
