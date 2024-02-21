import React from "react"
import { Highlight } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import Alert, { AlertProps } from "#/components/shared/Alert"

export default function AlertReceiveSTBTC({ ...restProps }: AlertProps) {
  return (
    // TODO: Add the correct action after click
    <Alert status="info" withActionIcon onclick={() => {}} {...restProps}>
      <TextMd>
        <Highlight query="stBTC" styles={{ textDecorationLine: "underline" }}>
          You will receive stBTC liquid staking token at this Ethereum address
          once the staking transaction is completed.
        </Highlight>
      </TextMd>
    </Alert>
  )
}
