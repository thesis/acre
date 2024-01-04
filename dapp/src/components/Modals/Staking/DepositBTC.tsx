import React from "react"
import Alert from "../../shared/Alert"
import { useDepositBTCTransaction, useModalFlowContext } from "../../../hooks"
import StakeSteps from "./StakeSteps"
import { TextMd } from "../../shared/Typography"

export default function DepositBTC() {
  const { goNext } = useModalFlowContext()
  const { depositBTC } = useDepositBTCTransaction(goNext)

  return (
    <StakeSteps
      header="Step 2 / 2"
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={depositBTC}
    >
      <Alert status="info">
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakeSteps>
  )
}
