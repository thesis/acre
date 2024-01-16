import React from "react"
import { Highlight } from "@chakra-ui/react"
import { useModalFlowContext, useSignMessage } from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import StakingSteps from "./components/StakingSteps"

export default function SignMessage() {
  const { goNext } = useModalFlowContext()
  const { signMessage } = useSignMessage(goNext)

  const handleClick = () => {
    signMessage().catch((error) => {
      throw error
    })
  }

  return (
    <StakingSteps buttonText="Continue" activeStep={0} onClick={handleClick}>
      {/* TODO: Add the correct action after click */}
      <Alert withActionIcon onclick={() => {}}>
        <TextMd>
          <Highlight query="stBTC" styles={{ textDecorationLine: "underline" }}>
            You will receive stBTC liquid staking token at this Ethereum address
            once the staking transaction is completed.
          </Highlight>
        </TextMd>
      </Alert>
    </StakingSteps>
  )
}
