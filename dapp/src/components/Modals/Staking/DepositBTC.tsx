import React from "react"
import Alert from "../../shared/Alert"
import { useModalFlowContext, useWalletContext } from "../../../hooks"
import StakeSteps from "./StakeSteps"
import { TextMd } from "../../shared/Typography"

export default function DepositBTC() {
  const { goNext } = useModalFlowContext()
  const { btcAccount } = useWalletContext()

  const handleSendBTC = async () => {
    if (!btcAccount?.id) return

    // TODO: Send the correct transaction
    goNext()
  }

  return (
    <StakeSteps
      header="Step 2 / 2"
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={handleSendBTC}
    >
      <Alert status="info" withIcon>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakeSteps>
  )
}
