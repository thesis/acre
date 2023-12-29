import React from "react"
import {
  Button,
  HStack,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StepNumber,
} from "@chakra-ui/react"
import StepperBase, { StepBase } from "../../shared/StepperBase"
import { TextLg, TextMd } from "../../shared/Typography"
import Spinner from "../../shared/Spinner"

function Title({ children }: { children: React.ReactNode }) {
  return <TextLg fontWeight="bold">{children}</TextLg>
}
function Description({ children }: { children: React.ReactNode }) {
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

export default function StakeSteps({
  header,
  buttonText,
  activeStep,
  onClick,
  children,
}: {
  header: string
  buttonText: string
  activeStep: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <ModalHeader>{header}</ModalHeader>
      <ModalBody textAlign="start" alignItems="start" py={6} gap={10}>
        <StepperBase
          index={activeStep}
          height={32}
          size="sm"
          orientation="vertical"
          colorScheme="green"
          complete={<StepNumber />}
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
