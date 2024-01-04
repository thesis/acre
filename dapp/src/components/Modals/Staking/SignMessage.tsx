import React from "react"
import { Highlight } from "@chakra-ui/react"
import Alert from "../../shared/Alert"
import { useModalFlowContext, useSignMessage } from "../../../hooks"
import StakeSteps from "./StakeSteps"
import { TextMd } from "../../shared/Typography"

export default function SignMessage() {
  const { goNext } = useModalFlowContext()
  const { signMessage } = useSignMessage(goNext)

  return (
    <StakeSteps
      header="Step 1 / 2"
      buttonText="Continue"
      activeStep={0}
      onClick={signMessage}
    >
      {/* TODO: Add the correct action after click */}
      <Alert status="info" withActionIcon onclick={() => {}}>
        <TextMd>
          <Highlight query="stBTC" styles={{ textDecorationLine: "underline" }}>
            You will receive stBTC liquid staking token at this Ethereum address
            once the staking transaction is completed.
          </Highlight>
        </TextMd>
      </Alert>
    </StakeSteps>
  )
}
