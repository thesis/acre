import React from "react"
import { StepBase } from "../../../shared/StepperBase"
import { Description, Title } from "../components/StakingSteps"

export const STEPS: StepBase[] = [
  {
    id: "sign-message",
    title: <Title>Sign message</Title>,
    description: (
      <Description>
        You will sign a gas-free Ethereum message to indicate the address where
        you&apos;d like to get your stBTC liquid staking token.
      </Description>
    ),
  },
  {
    id: "deposit-btc",
    title: <Title>Deposit BTC</Title>,
    description: (
      <Description>
        You will make a Bitcoin transaction to deposit and stake your BTC.
      </Description>
    ),
  },
]
