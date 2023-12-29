import React from "react"
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StepNumber,
} from "@chakra-ui/react"
import { ModalStep } from "../../../contexts"
import StepperBase from "../../shared/StepperBase"
import { TextLg, TextMd } from "../../shared/Typography"

function Title({ children }: { children: React.ReactNode }) {
  return <TextLg fontWeight="bold">{children}</TextLg>
}

function Description({ children }: { children: React.ReactNode }) {
  return <TextMd color="grey.500">{children}</TextMd>
}

const STEPS = [
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

export default function Overview({ goNext }: ModalStep) {
  return (
    <>
      <ModalHeader>Staking steps overview</ModalHeader>
      <ModalBody textAlign="start" py={6} mx={3}>
        <StepperBase
          index={-1}
          height={64}
          size="sm"
          orientation="vertical"
          complete={<StepNumber />}
          steps={STEPS}
        />
      </ModalBody>
      <ModalFooter>
        <Button size="lg" width="100%" onClick={goNext}>
          Continue
        </Button>
      </ModalFooter>
    </>
  )
}
