import React from "react"
import { Highlight } from "@chakra-ui/react"
import { CardAlert, CardAlertProps } from "./CardAlert"
import { TextMd } from "../Typography"

export function ReceiveSTBTCAlert({ ...restProps }: CardAlertProps) {
  return (
    // TODO: Add the correct action after click
    <CardAlert status="error" withLink {...restProps}>
      <TextMd>
        <Highlight query="stBTC" styles={{ textDecorationLine: "underline" }}>
          You will receive stBTC liquid staking token at this Ethereum address
          once the staking transaction is completed.
        </Highlight>
      </TextMd>
    </CardAlert>
  )
}
