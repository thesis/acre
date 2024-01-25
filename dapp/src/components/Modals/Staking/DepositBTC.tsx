import React, { useCallback } from "react"
import { useDepositBTCTransaction, useModalFlowContext } from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import StakingSteps from "./components/StakingSteps"

export default function DepositBTC() {
  const { goNext, endTransactionProcess } = useModalFlowContext()

  const onDepositSuccess = useCallback(() => {
    endTransactionProcess()
    goNext()
  }, [endTransactionProcess, goNext])

  const { depositBTC } = useDepositBTCTransaction(onDepositSuccess)

  return (
    <StakingSteps buttonText="Deposit BTC" activeStep={1} onClick={depositBTC}>
      <Alert>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakingSteps>
  )
}
