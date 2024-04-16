import React from "react"
import { HStack, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import { TextLg, TextMd } from "#/components/shared/Typography"
import StepperBase, { StepBase } from "#/components/shared/StepperBase"
import Spinner from "#/components/shared/Spinner"
import { LoadingButton } from "#/components/shared/LoadingButton"

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

export default function StakingStepsModalContent({
  buttonText,
  isLoading,
  activeStep,
  onClick,
  children,
}: {
  buttonText: string
  activeStep: number
  isLoading?: boolean
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
        <LoadingButton
          size="lg"
          width="100%"
          onClick={onClick}
          isLoading={isLoading}
        >
          {buttonText}
        </LoadingButton>
      </ModalFooter>
    </>
  )
}
