import React from "react"
import {
  Button,
  HStack,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { TextLg, TextMd } from "../../../shared/Typography"
import StepperBase, { StepBase } from "../../../shared/StepperBase"
import Spinner from "../../../shared/Spinner"

export function Title({ children }: { children: React.ReactNode }) {
  return <TextLg fontWeight="bold">{children}</TextLg>
}

export function Description({ children }: { children: React.ReactNode }) {
  return <TextMd color="grey.500">{children}</TextMd>
}

const STEPS: StepBase[] = [
  {
    id: "sign-message",
    title: <Title>Sign message</Title>,
    description: (
      <HStack>
        <Spinner size="md" />
        <Description>Sign the message in your ETH wallet.</Description>
      </HStack>
    ),
  },
  {
    id: "deposit-btc",
    title: <Title>Deposit BTC</Title>,
    description: (
      <HStack>
        <Spinner size="md" />
        <Description>Waiting for your deposit...</Description>
      </HStack>
    ),
  },
]

export default function StakingSteps({
  buttonText,
  activeStep,
  onClick,
  children,
}: {
  buttonText: string
  activeStep: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <ModalHeader>{`Step ${activeStep + 1} / ${STEPS.length}`}</ModalHeader>
      <ModalBody textAlign="start" alignItems="start" py={6} gap={10}>
        <StepperBase
          index={activeStep}
          height={32}
          size="sm"
          orientation="vertical"
          colorScheme="green"
          steps={STEPS}
          hideDescriptionWhenInactive
        />
        {children}
      </ModalBody>
      <ModalFooter>
        <Button size="lg" width="100%" onClick={onClick}>
          {buttonText}
        </Button>
      </ModalFooter>
    </>
  )
}
