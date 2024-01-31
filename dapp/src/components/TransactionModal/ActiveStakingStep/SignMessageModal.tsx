import React, { useEffect } from "react"
import { Highlight } from "@chakra-ui/react"
import { useModalFlowContext, useSignMessage } from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import { asyncWrapper } from "#/utils"
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
      {/* TODO: Add the correct action after click */}
      <Alert withActionIcon onclick={() => {}}>
        <TextMd>
          <Highlight query="stBTC" styles={{ textDecorationLine: "underline" }}>
            You will receive stBTC liquid staking token at this Ethereum address
            once the staking transaction is completed.
          </Highlight>
        </TextMd>
      </Alert>
    </StakingStepsModalContent>
  )
}
