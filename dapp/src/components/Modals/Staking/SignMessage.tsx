import React, { useEffect } from "react"
import { Highlight } from "@chakra-ui/react"
import { useSignMessage } from "@ledgerhq/wallet-api-client-react"
import Alert from "../../shared/Alert"
import { useModalFlowContext, useWalletContext } from "../../../hooks"
import StakeSteps from "./StakeSteps"
import { TextMd } from "../../shared/Typography"

const SIGN_MESSAGE = "Test message"

export default function SignMessage() {
  const { goNext } = useModalFlowContext()
  const { ethAccount } = useWalletContext()
  const { signMessage, signature } = useSignMessage()

  const handleSignMessage = async () => {
    if (!ethAccount?.id) return

    await signMessage(ethAccount.id, Buffer.from(SIGN_MESSAGE, "utf-8"))
  }

  useEffect(() => {
    if (signature) {
      goNext()
    }
  }, [goNext, signature])

  return (
    <StakeSteps
      header="Step 1 / 2"
      buttonText="Continue"
      activeStep={0}
      onClick={handleSignMessage}
    >
      <Alert status="info" withIcon>
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
